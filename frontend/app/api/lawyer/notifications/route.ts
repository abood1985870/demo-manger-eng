import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId, tenantId: session.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await request.json(); // if id is provided, mark one, else mark all

    if (id) {
      const updated = await prisma.notification.updateMany({
        where: { id, userId: session.userId, tenantId: session.tenantId },
        data: { isRead: true }
      });
      return NextResponse.json(updated);
    } else {
      const updated = await prisma.notification.updateMany({
        where: { userId: session.userId, tenantId: session.tenantId, isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error('Failed to update notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
