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
    const status = searchParams.get('status');

    const where: any = {
      tenantId: session.tenantId,
    };

    if (matterId) where.matterId = matterId;
    if (status && status !== 'all') where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        matter: { select: { id: true, title: true, caseNumber: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب المهام.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession('timeline');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, matterId, userId, priority, dueDate } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'عنوان المهمة مطلوب' }, { status: 400 });
    }

    // Verify assigned user belongs to the SAME tenant
    if (userId) {
      const assignedUser = await prisma.user.findFirst({
        where: { id: userId, tenantId: session.tenantId, isActive: true }
      });
      if (!assignedUser) {
        return NextResponse.json({ error: 'المستخدم المسؤول غير موجـود أو ينتمي لشركة أخرى' }, { status: 400 });
      }
    }

    // Verify matter belongs to the SAME tenant if provided
    if (matterId) {
      const matter = await prisma.matter.findFirst({
        where: { id: matterId, tenantId: session.tenantId }
      });
      if (!matter) {
        return NextResponse.json({ error: 'المشروع غير موجـودة أو غير تابعة لشركتك' }, { status: 403 });
      }
    }

    const task = await prisma.task.create({
      data: {
        tenantId: session.tenantId,
        matterId: matterId || null,
        userId: userId || session.userId,
        title: title.trim(),
        description: description || null,
        priority: priority || 'MEDIUM',
        status: 'NEW',
        isDone: false,
        dueDate: dueDate ? new Date(dueDate) : null,
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
      action: 'TASK_CREATE',
      entityType: 'Task',
      entityId: task.id,
      metadata: { title: task.title, matterId: task.matterId, assignedUserId: task.userId },
      req: request,
    });

    return NextResponse.json(task, { status: 201 });

  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة المهمة.' }, { status: 500 });
  }
}
