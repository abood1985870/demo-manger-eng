import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hasPermission } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, ['ADMIN', 'OWNER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      include: {
        _count: {
          select: { users: true, clients: true, matters: true, invoices: true },
        },
        users: {
          select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const documentCount = await prisma.document.count({ where: { matter: { tenantId: session.tenantId } } });

    return NextResponse.json({
      tenant: { id: tenant.id, name: tenant.name, domain: tenant.domain, createdAt: tenant.createdAt },
      counts: { ...tenant._count, documents: documentCount },
      users: tenant.users,
    });
  } catch (error) {
    console.error('Failed to fetch admin overview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
