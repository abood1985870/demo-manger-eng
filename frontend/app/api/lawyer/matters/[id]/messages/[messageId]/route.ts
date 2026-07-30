export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getMatterForAuthorizedUser } from '@/lib/matter-access';
import { writeAuditLog } from '@/lib/audit';

async function getEditableMessage(userId: string, tenantId: string, matterId: string, messageId: string) {
  return prisma.matterMessage.findFirst({ where: { id: messageId, authorId: userId, tenantId, matterId } });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; messageId: string }> }) {
  try {
    const { id, messageId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const matter = await getMatterForAuthorizedUser(session, id);
    if (!matter) return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
    const message = await getEditableMessage(session.userId, session.tenantId, matter.id, messageId);
    if (!message) return NextResponse.json({ error: 'Message not found or not owned by user' }, { status: 404 });
    if (message.deletedAt) return NextResponse.json({ error: 'Message already deleted' }, { status: 409 });
    const updated = await prisma.matterMessage.update({ where: { id: message.id }, data: { deletedAt: new Date(), body: 'تم حذف هذه الرسالة' } });
    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'matter.message.deleted',
      entityType: 'MatterMessage',
      entityId: updated.id,
      metadata: { matterId: matter.id },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; messageId: string }> }) {
  try {
    const { id, messageId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const matter = await getMatterForAuthorizedUser(session, id);
    if (!matter) return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
    const message = await getEditableMessage(session.userId, session.tenantId, matter.id, messageId);
    if (!message) return NextResponse.json({ error: 'Message not found or not owned by user' }, { status: 404 });
    if (message.deletedAt) return NextResponse.json({ error: 'Cannot edit a deleted message' }, { status: 400 });
    if (Date.now() - message.createdAt.getTime() > 15 * 60 * 1000) return NextResponse.json({ error: 'You can only edit messages within 15 minutes of sending' }, { status: 403 });

    const { body } = await request.json();
    const updatedBody = typeof body === 'string' ? body.trim() : '';
    if (!updatedBody) return NextResponse.json({ error: 'Message body cannot be empty' }, { status: 400 });
    const updated = await prisma.matterMessage.update({ where: { id: message.id }, data: { body: updatedBody } });
    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'matter.message.updated',
      entityType: 'MatterMessage',
      entityId: updated.id,
      metadata: { matterId: matter.id },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to edit message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
