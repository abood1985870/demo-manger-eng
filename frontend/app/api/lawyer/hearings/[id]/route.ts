import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hearingId } = await params;
    const session = await getSession('timeline');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const hearing = await prisma.hearing.findUnique({
      where: { id: hearingId }
    });

    if (!hearing) {
      return NextResponse.json({ error: 'الموعد غير موجـود' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (hearing.tenantId && hearing.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذا الموعد' }, { status: 403 });
    }

    const body = await request.json();
    const { date, court, summary, status, type, title } = body;

    const updatedHearing = await prisma.hearing.update({
      where: { id: hearingId },
      data: {
        date: date ? new Date(date) : hearing.date,
        court: court !== undefined ? court : hearing.court,
        summary: summary !== undefined ? summary : hearing.summary,
        status: status !== undefined ? status : hearing.status,
        type: type !== undefined ? type : hearing.type,
        title: title !== undefined ? title : hearing.title,
      }
    });

    // Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'HEARING_UPDATE',
      entityType: 'Hearing',
      entityId: updatedHearing.id,
      metadata: { status: updatedHearing.status, date: updatedHearing.date },
      req: request,
    });

    return NextResponse.json(updatedHearing);

  } catch (error: any) {
    console.error('Error updating hearing:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الموعد.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hearingId } = await params;
    const session = await getSession('timeline');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const hearing = await prisma.hearing.findUnique({
      where: { id: hearingId }
    });

    if (!hearing) {
      return NextResponse.json({ error: 'الموعد غير موجـود' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (hearing.tenantId && hearing.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذا الموعد' }, { status: 403 });
    }

    await prisma.hearing.delete({
      where: { id: hearingId }
    });

    return NextResponse.json({ success: true, message: 'تم حذف الموعد بنجاح' });

  } catch (error: any) {
    console.error('Error deleting hearing:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الموعد.' }, { status: 500 });
  }
}
