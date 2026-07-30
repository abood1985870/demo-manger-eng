export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkMatterAccess } from '@/lib/matter-access-control';
import { logAudit } from '@/lib/audit-logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matterId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const access = await checkMatterAccess(session, matterId, 'view');
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || 'غير مصرح لك بالوصول لهذه المشروع' }, { status: 403 });
    }

    const parties = await prisma.matterParty.findMany({
      where: {
        matterId,
        tenantId: session.tenantId,
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(parties);

  } catch (error: any) {
    console.error('Error fetching matter parties:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب أطراف المشروع.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matterId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const access = await checkMatterAccess(session, matterId, 'edit');
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || 'غير مصرح لك بتعديل هذه المشروع' }, { status: 403 });
    }

    const body = await request.json();
    const { name, partyType, role, nationalIdOrCr, phone, email, address, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'اسم الطرف مطلوب' }, { status: 400 });
    }

    const party = await prisma.matterParty.create({
      data: {
        matterId,
        tenantId: session.tenantId,
        name: name.trim(),
        partyType: partyType || 'PERSON',
        role: role || 'THIRD_PARTY',
        nationalIdOrCr: nationalIdOrCr || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        notes: notes || null,
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_PARTY_CREATE',
      entityType: 'MatterParty',
      entityId: party.id,
      metadata: { matterId, partyName: party.name, role: party.role },
      req: request,
    });

    return NextResponse.json(party, { status: 201 });

  } catch (error: any) {
    console.error('Error creating matter party:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة الطرف بالمشروع.' }, { status: 500 });
  }
}
