import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hasPermission } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

const allowedRoles = ['ADMIN', 'OWNER', 'LAWYER', 'ASSISTANT', 'READ_ONLY'];

export async function GET() {
  const session = await getSession('compliance');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const records = await prisma.complianceCase.findMany({
    where: { tenantId: session.tenantId },
    include: { client: true },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  try {
    const session = await getSession('compliance');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(session.role, allowedRoles)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await request.json();
    const title = typeof data.title === 'string' ? data.title.trim() : '';
    const caseType = typeof data.caseType === 'string' ? data.caseType.trim() : '';
    if (!title || !caseType) return NextResponse.json({ error: 'Title and case type are required' }, { status: 400 });

    const clientId = typeof data.clientId === 'string' && data.clientId ? data.clientId : null;
    if (clientId) {
      const client = await prisma.client.findFirst({ where: { id: clientId, tenantId: session.tenantId } });
      if (!client) return NextResponse.json({ error: 'Client not found or unauthorized' }, { status: 400 });
    }

    const record = await prisma.complianceCase.create({
      data: {
        tenantId: session.tenantId,
        clientId,
        title,
        caseType,
        riskLevel: typeof data.riskLevel === 'string' ? data.riskLevel : 'medium',
        status: typeof data.status === 'string' ? data.status : 'under_review',
        restriction: typeof data.restriction === 'string' ? data.restriction.trim() || null : null,
        details: typeof data.details === 'string' ? data.details.trim() || null : null,
      },
      include: { client: true },
    });

    await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'compliance.created', entityType: 'ComplianceCase', entityId: record.id });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Failed to create compliance record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession('compliance');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(session.role, allowedRoles)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const data = await request.json();
    if (!data.id || typeof data.id !== 'string') return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    const existing = await prisma.complianceCase.findFirst({ where: { id: data.id, tenantId: session.tenantId } });
    if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    const updated = await prisma.complianceCase.update({
      where: { id: existing.id },
      data: {
        title: data.title === undefined ? undefined : String(data.title).trim(),
        caseType: data.caseType === undefined ? undefined : String(data.caseType).trim(),
        riskLevel: data.riskLevel === undefined ? undefined : String(data.riskLevel),
        status: data.status === undefined ? undefined : String(data.status),
        restriction: data.restriction === undefined ? undefined : String(data.restriction).trim() || null,
        details: data.details === undefined ? undefined : String(data.details).trim() || null,
      },
      include: { client: true },
    });
    await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'compliance.updated', entityType: 'ComplianceCase', entityId: updated.id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update compliance record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession('compliance');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(session.role, ['ADMIN', 'OWNER'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await request.json();
    const existing = await prisma.complianceCase.findFirst({ where: { id, tenantId: session.tenantId } });
    if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    await prisma.complianceCase.delete({ where: { id: existing.id } });
    await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'compliance.deleted', entityType: 'ComplianceCase', entityId: existing.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete compliance record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
