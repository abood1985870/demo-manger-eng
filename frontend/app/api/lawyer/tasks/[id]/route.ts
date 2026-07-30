export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const session = await getSession('timeline');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ error: 'المهمة غير موجـودة' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (task.tenantId && task.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه المهمة' }, { status: 403 });
    }

    if (!hasPermission(session.role, ['ADMIN', 'OWNER']) && task.userId !== session.userId) {
      return NextResponse.json({ error: 'You are not allowed to update this task' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, userId, isDone } = body;

    if (userId !== undefined && userId) {
      const assignedUser = await prisma.user.findFirst({
        where: { id: userId, tenantId: session.tenantId, isActive: true },
      });
      if (!assignedUser) {
        return NextResponse.json({ error: 'Assigned user is unavailable' }, { status: 400 });
      }
    }

    let updatedStatus = status || task.status;
    let updatedIsDone = isDone !== undefined ? isDone : task.isDone;

    if (status === 'DONE') {
      updatedIsDone = true;
    } else if (isDone === true) {
      updatedStatus = 'DONE';
    } else if (isDone === false && task.status === 'DONE') {
      updatedStatus = 'IN_PROGRESS';
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        status: updatedStatus,
        priority: priority !== undefined ? priority : task.priority,
        isDone: updatedIsDone,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate,
        userId: userId !== undefined ? userId : task.userId,
      },
      include: {
        user: { select: { id: true, name: true } },
        matter: { select: { id: true, title: true } }
      }
    });

    // Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'TASK_UPDATE',
      entityType: 'Task',
      entityId: updatedTask.id,
      metadata: { status: updatedTask.status, isDone: updatedTask.isDone },
      req: request,
    });

    return NextResponse.json(updatedTask);

  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث المهمة.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const session = await getSession('timeline');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ error: 'المهمة غير موجـودة' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (task.tenantId && task.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه المهمة' }, { status: 403 });
    }

    if (!hasPermission(session.role, ['ADMIN', 'OWNER']) && task.userId !== session.userId) {
      return NextResponse.json({ error: 'You are not allowed to delete this task' }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({ success: true, message: 'تم حذف المهمة بنجاح' });

  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف المهمة.' }, { status: 500 });
  }
}
