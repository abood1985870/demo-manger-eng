import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'اسم الشخص أو الشركة مطلوب لفحص تعارض المصالح' }, { status: 400 });
    }

    const queryName = name.trim();
    const queryLower = queryName.toLowerCase();

    const matches: Array<{
      type: string;
      typeName: string;
      id: string;
      name: string;
      details?: string;
      matterId?: string;
      matterTitle?: string;
      risk: 'HIGH' | 'MEDIUM';
    }> = [];

    // 1. Search Clients in tenant
    const clients = await prisma.client.findMany({
      where: {
        tenantId: session.tenantId,
        name: { contains: queryName }
      },
      select: { id: true, name: true, email: true, phone: true }
    });

    for (const c of clients) {
      const isExact = c.name.trim().toLowerCase() === queryLower;
      matches.push({
        type: 'CLIENT',
        typeName: 'عميل أو مستثمر مسجل لدى الشركة',
        id: c.id,
        name: c.name,
        details: c.email || c.phone || 'عميل رئيسي',
        risk: isExact ? 'HIGH' : 'MEDIUM'
      });
    }

    // 2. Search external contractors, suppliers, and stakeholders in projects.
    const opponentMatters = await prisma.matter.findMany({
      where: {
        tenantId: session.tenantId,
        externalPartyName: { contains: queryName }
      },
      select: { id: true, title: true, caseNumber: true, externalPartyName: true }
    });

    for (const m of opponentMatters) {
      if (m.externalPartyName) {
        const isExact = m.externalPartyName.trim().toLowerCase() === queryLower;
        matches.push({
          type: 'OPPONENT',
          typeName: 'مقاول أو مورد أو طرف خارجي في مشروع',
          id: m.id,
          name: m.externalPartyName,
          matterId: m.id,
          matterTitle: `${m.caseNumber ? `(${m.caseNumber}) ` : ''}${m.title}`,
          risk: isExact ? 'HIGH' : 'MEDIUM'
        });
      }
    }

    // 3. Search Multiple Matter Parties (MatterParty)
    const matterParties = await prisma.matterParty.findMany({
      where: {
        tenantId: session.tenantId,
        name: { contains: queryName }
      },
      include: {
        matter: { select: { id: true, title: true, caseNumber: true } }
      }
    });

    for (const p of matterParties) {
      const isExact = p.name.trim().toLowerCase() === queryLower;
      matches.push({
        type: 'PARTY',
        typeName: `طرف مشروع (${p.role})`,
        id: p.id,
        name: p.name,
        matterId: p.matterId,
        matterTitle: `${p.matter.caseNumber ? `(${p.matter.caseNumber}) ` : ''}${p.matter.title}`,
        risk: isExact ? 'HIGH' : 'MEDIUM'
      });
    }

    // 4. Calculate Risk Level & Reason
    const hasHighRisk = matches.some(m => m.risk === 'HIGH');
    const hasMediumRisk = matches.length > 0;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let reason = 'لم يتم العثور على سجل مطابق أو اسم متكرر';

    if (hasHighRisk) {
      riskLevel = 'HIGH';
      reason = `تنبيه: تم العثور على مطابقة تامة لاسم (${queryName}) مع عميل أو مشروع أو طرف مسجل سابقاً لدى الشركة`;
    } else if (hasMediumRisk) {
      riskLevel = 'MEDIUM';
      reason = `تنبيه: يوجد تشابه جزئي في الاسم مع ${matches.length} سجل مسجل لدى الشركة`;
    }

    // Save conflict check record
    const conflictCheck = await prisma.matterConflictCheck.create({
      data: {
        tenantId: session.tenantId,
        checkedName: queryName,
        matchedEntityType: matches.length > 0 ? matches[0].type : 'NONE',
        matchedEntityId: matches.length > 0 ? matches[0].id : null,
        riskLevel,
        reason,
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'CONFLICT_CHECK_PERFORM',
      entityType: 'MatterConflictCheck',
      entityId: conflictCheck.id,
      metadata: { checkedName: queryName, riskLevel, matchesCount: matches.length },
      req: request,
    });

    return NextResponse.json({
      id: conflictCheck.id,
      checkedName: queryName,
      riskLevel,
      reason,
      matches,
      requiresManagerAck: riskLevel === 'HIGH',
      hasConflict: riskLevel !== 'LOW'
    });

  } catch (error: any) {
    console.error('Error performing conflict check:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إجراء فحص تعارض المصالح.' }, { status: 500 });
  }
}
