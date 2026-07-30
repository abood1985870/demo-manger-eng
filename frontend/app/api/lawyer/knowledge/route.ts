export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hasPermission } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

const allowedRoles = ['ADMIN', 'OWNER', 'LAWYER', 'ASSISTANT', 'READ_ONLY'];

export async function GET() {
  const session = await getSession('documents');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await prisma.knowledgeItem.findMany({
    where: { tenantId: session.tenantId },
    include: { createdBy: { select: { id: true, name: true, role: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const session = await getSession('documents');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(session.role, allowedRoles)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const data = await request.json();
    const title = typeof data.title === 'string' ? data.title.trim() : '';
    const category = typeof data.category === 'string' ? data.category.trim() : '';
    const content = typeof data.content === 'string' ? data.content.trim() : '';
    if (!title || !category || !content) return NextResponse.json({ error: 'Title, category, and content are required' }, { status: 400 });

    const item = await prisma.knowledgeItem.create({
      data: {
        tenantId: session.tenantId,
        createdById: session.userId,
        title,
        category,
        content,
        fileName: typeof data.fileName === 'string' ? data.fileName.trim() || null : null,
        fileUrl: typeof data.fileUrl === 'string' ? data.fileUrl.trim() || null : null,
      },
      include: { createdBy: { select: { id: true, name: true, role: true } } },
    });
    await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'knowledge.created', entityType: 'KnowledgeItem', entityId: item.id });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create knowledge item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession('documents');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(session.role, allowedRoles)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const data = await request.json();
    const existing = await prisma.knowledgeItem.findFirst({ where: { id: data.id, tenantId: session.tenantId } });
    if (!existing) return NextResponse.json({ error: 'Knowledge item not found' }, { status: 404 });
    const item = await prisma.knowledgeItem.update({
      where: { id: existing.id },
      data: {
        title: data.title === undefined ? undefined : String(data.title).trim(),
        category: data.category === undefined ? undefined : String(data.category).trim(),
        content: data.content === undefined ? undefined : String(data.content).trim(),
      },
      include: { createdBy: { select: { id: true, name: true, role: true } } },
    });
    await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'knowledge.updated', entityType: 'KnowledgeItem', entityId: item.id });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update knowledge item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession('documents');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(session.role, ['ADMIN', 'OWNER'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await request.json();
    const existing = await prisma.knowledgeItem.findFirst({ where: { id, tenantId: session.tenantId } });
    if (!existing) return NextResponse.json({ error: 'Knowledge item not found' }, { status: 404 });
    await prisma.knowledgeItem.delete({ where: { id: existing.id } });
    await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'knowledge.deleted', entityType: 'KnowledgeItem', entityId: existing.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete knowledge item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
