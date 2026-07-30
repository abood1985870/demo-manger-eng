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

    const deadlines = await prisma.matterDeadline.findMany({
      where: {
        matterId,
        tenantId: session.tenantId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json(deadlines);

  } catch (error: any) {
    console.error('Error fetching matter deadlines:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب المهل النظامية.' }, { status: 500 });
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

    const access = await checkMatterAccess(session, matterId, 'hearings');
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || 'غير مصرح لك بإدارة الالمواعيد والمراحل لهذه المشروع' }, { status: 403 });
    }

    const body = await request.json();
    const { title, deadlineType, dueDate, reminderDate, notes, assignedToId } = body;

    if (!title || !title.trim() || !dueDate) {
      return NextResponse.json({ error: 'عنوان المهلة النظامية وتاريخ استحقاقها مطلوبان' }, { status: 400 });
    }

    const deadline = await prisma.matterDeadline.create({
      data: {
        matterId,
        tenantId: session.tenantId,
        title: title.trim(),
        deadlineType: deadlineType || 'SUBMISSION_DEADLINE',
        dueDate: new Date(dueDate),
        reminderDate: reminderDate ? new Date(reminderDate) : null,
        status: 'OPEN',
        notes: notes || null,
        createdById: session.userId,
        assignedToId: assignedToId || null,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    // Create Notification if assigned to someone
    if (assignedToId) {
      await prisma.notification.create({
        data: {
          tenantId: session.tenantId,
          userId: assignedToId,
          title: `مهلة نظامية جديدة: ${deadline.title}`,
          message: `تم تكليفك بمهلة نظامية موعد استحقاقها في ${new Date(deadline.dueDate).toLocaleDateString('ar-SA')}`,
        }
      });
    }

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_DEADLINE_CREATE',
      entityType: 'MatterDeadline',
      entityId: deadline.id,
      metadata: { matterId, title: deadline.title, dueDate: deadline.dueDate },
      req: request,
    });

    return NextResponse.json(deadline, { status: 201 });

  } catch (error: any) {
    console.error('Error creating matter deadline:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة المهلة النظامية.' }, { status: 500 });
  }
}
