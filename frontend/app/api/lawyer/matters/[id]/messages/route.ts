import { NextResponse } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getMatterForAuthorizedUser } from '@/lib/matter-access';
import { writeAuditLog } from '@/lib/audit';

const authorSelect = { id: true, name: true, role: true, avatarUrl: true };

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const matter = await getMatterForAuthorizedUser(session, id);
    if (!matter) return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });

    const messages = await prisma.matterMessage.findMany({
      where: { matterId: matter.id, tenantId: session.tenantId },
      include: { author: { select: authorSelect }, replyTo: { select: { id: true, body: true, deletedAt: true, author: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const matter = await getMatterForAuthorizedUser(session, id);
    if (!matter) return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });

    const { body, replyToMessageId, clientRequestId } = await request.json();
    const messageBody = typeof body === 'string' ? body.trim() : '';
    if (!messageBody) return NextResponse.json({ error: 'Message body cannot be empty' }, { status: 400 });
    if (!clientRequestId || typeof clientRequestId !== 'string') {
      return NextResponse.json({ error: 'Missing client request identifier' }, { status: 400 });
    }
    if (replyToMessageId) {
      const replyTarget = await prisma.matterMessage.findFirst({ where: { id: replyToMessageId, matterId: matter.id, tenantId: session.tenantId, deletedAt: null } });
      if (!replyTarget) return NextResponse.json({ error: 'Invalid reply target' }, { status: 400 });
    }

    const memberIds = Array.from(new Set([matter.lawyerId, ...matter.teamMembers.map((member) => member.id)].filter(Boolean))) as string[];
    const members = await prisma.user.findMany({ where: { id: { in: memberIds }, tenantId: session.tenantId, isActive: true }, select: { id: true, name: true } });
    const mentionedUserIds = members.filter((user) => messageBody.includes(`@${user.name}`)).map((user) => user.id);

    let newMessage;
    try {
      newMessage = await prisma.matterMessage.create({
        data: { tenantId: session.tenantId, matterId: matter.id, authorId: session.userId, body: messageBody, replyToMessageId: replyToMessageId || null, clientRequestId, mentions: { create: mentionedUserIds.map((mentionedUserId) => ({ mentionedUserId })) } },
        include: { author: { select: authorSelect }, replyTo: { select: { id: true, body: true, deletedAt: true, author: { select: { name: true } } } } },
      });
    } catch (error) {
      if (!(error instanceof PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
      const existing = await prisma.matterMessage.findFirst({ where: { authorId: session.userId, clientRequestId, matterId: matter.id, tenantId: session.tenantId }, include: { author: { select: authorSelect }, replyTo: { select: { id: true, body: true, deletedAt: true, author: { select: { name: true } } } } } });
      return NextResponse.json(existing);
    }

    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'matter.message.created',
      entityType: 'MatterMessage',
      entityId: newMessage.id,
      metadata: { matterId: matter.id, replyToMessageId: replyToMessageId || null },
    });

    const notificationIds = Array.from(new Set(memberIds.filter((id) => id !== session.userId)));
    if (notificationIds.length) {
      await prisma.notification.createMany({ data: notificationIds.map((userId) => ({
        tenantId: session.tenantId, userId,
        title: mentionedUserIds.includes(userId) ? 'إشارة في تعقيب' : 'تعقيب جديد',
        message: mentionedUserIds.includes(userId) ? `أشار إليك ${newMessage.author.name} في مشروع: ${matter.title}` : `أضاف ${newMessage.author.name} تعقيباً في مشروع: ${matter.title}`,
        link: `/matters?matterId=${matter.id}`,
      })) });
    }
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
