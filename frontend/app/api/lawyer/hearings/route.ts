import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

export async function GET(request: Request) {
  try {
    const session = await getSession('timeline');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const matterId = searchParams.get('matterId');

    const where: any = {
      tenantId: session.tenantId,
    };

    if (matterId) where.matterId = matterId;

    const hearings = await prisma.hearing.findMany({
      where,
      include: {
        matter: { select: { id: true, title: true, caseNumber: true } }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json(hearings);
  } catch (error: any) {
    console.error('Error fetching hearings:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الجلسات والمواعيد.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession('timeline');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { matterId, date, court, summary, type, title } = body;

    if (!matterId || !date) {
      return NextResponse.json({ error: 'المشروع والتاريخ مطلوبان لإنشاء الموعد' }, { status: 400 });
    }

    // Verify matter belongs to session tenant
    const matter = await prisma.matter.findFirst({
      where: { id: matterId, tenantId: session.tenantId }
    });

    if (!matter) {
      return NextResponse.json({ error: 'المشروع غير موجـودة أو غير تابعة لشركتك' }, { status: 403 });
    }

    const hearing = await prisma.hearing.create({
      data: {
        tenantId: session.tenantId,
        matterId,
        date: new Date(date),
        court: court || 'الموقع أو الجهة المختصة',
        summary: summary || null,
        type: type || 'HEARING',
        title: title || null,
        status: 'upcoming',
      },
      include: {
        matter: { select: { id: true, title: true } }
      }
    });

    // Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'HEARING_CREATE',
      entityType: 'Hearing',
      entityId: hearing.id,
      metadata: { matterId: hearing.matterId, date: hearing.date, type: hearing.type },
      req: request,
    });

    return NextResponse.json(hearing, { status: 201 });

  } catch (error: any) {
    console.error('Error creating hearing:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة الموعد أو المرحلة.' }, { status: 500 });
  }
}
