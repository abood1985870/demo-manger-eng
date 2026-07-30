import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isValidMatterStatus } from '@/lib/matter-status';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: matterId } = await params;
    const body = await request.json();
    const { status, note } = body;

    if (!isValidMatterStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: { teamMembers: true }
    });

    if (!matter || matter.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
    }

    // Permission check
    const isOwnerOrAdmin = session.role === 'admin' || session.role === 'owner' || session.role === 'superadmin';
    const isLawyerInCharge = matter.lawyerId === session.userId;
    const isTeamMember = matter.teamMembers.some((member: any) => member.id === session.userId);

    if (!isOwnerOrAdmin && !isLawyerInCharge && !isTeamMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (matter.status === status) {
      return NextResponse.json(matter);
    }

    // specific business logic rules
    if (matter.status === 'ARCHIVED' && status !== 'ARCHIVED' && !isOwnerOrAdmin) {
      return NextResponse.json({ error: 'Only admins can restore archived matters' }, { status: 403 });
    }
    if (status === 'COMPLETED' && !note && matter.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Must provide a note when completing a matter' }, { status: 400 });
    }

    const updatedMatter = await prisma.matter.update({
      where: { id: matterId },
      data: {
        status,
        statusUpdatedAt: new Date(),
        statusUpdatedById: session.userId,
        statusHistory: {
          create: {
            oldStatus: matter.status,
            newStatus: status,
            changedById: session.userId,
            note: note || null
          }
        }
      }
    });

    // Notify the responsible lawyer if the updater is someone else
    if (matter.lawyerId && matter.lawyerId !== session.userId) {
      await prisma.notification.create({
        data: {
          tenantId: session.tenantId,
          userId: matter.lawyerId,
          title: 'تحديث حالة المشروع',
          message: `تم تحديث حالة المشروع "${matter.title}" إلى ${status}.`,
          link: `/matters/${matterId}`
        }
      });
    }

    return NextResponse.json(updatedMatter);
  } catch (error) {
    console.error('Failed to update matter status', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
