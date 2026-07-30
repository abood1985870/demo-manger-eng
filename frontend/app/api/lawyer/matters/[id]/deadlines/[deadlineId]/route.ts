import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkMatterAccess } from '@/lib/matter-access-control';
import { logAudit } from '@/lib/audit-logger';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; deadlineId: string }> }
) {
  try {
    const { id: matterId, deadlineId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const access = await checkMatterAccess(session, matterId, 'hearings');
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || 'غير مصرح لك بتعديل المهل في هذه المشروع' }, { status: 403 });
    }

    const deadline = await prisma.matterDeadline.findUnique({
      where: { id: deadlineId }
    });

    if (!deadline || deadline.matterId !== matterId || deadline.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'المهلة غير موجودة أو غير تابعة لهذه المشروع' }, { status: 404 });
    }

    const body = await request.json();
    const { status, notes, title, dueDate, assignedToId } = body;

    const updatedDeadline = await prisma.matterDeadline.update({
      where: { id: deadlineId },
      data: {
        status: status !== undefined ? status : deadline.status,
        notes: notes !== undefined ? notes : deadline.notes,
        title: title !== undefined ? title.trim() : deadline.title,
        dueDate: dueDate ? new Date(dueDate) : deadline.dueDate,
        assignedToId: assignedToId !== undefined ? assignedToId : deadline.assignedToId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_DEADLINE_UPDATE',
      entityType: 'MatterDeadline',
      entityId: deadlineId,
      metadata: { matterId, title: updatedDeadline.title, status: updatedDeadline.status },
      req: request,
    });

    return NextResponse.json(updatedDeadline);

  } catch (error: any) {
    console.error('Error updating matter deadline:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث المهلة النظامية.' }, { status: 500 });
  }
}
