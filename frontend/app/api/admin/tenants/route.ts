export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role.toLowerCase() !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        createdAt: true,
        _count: { select: { users: true, matters: true } },
      }
    });
    return NextResponse.json(tenants);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role.toLowerCase() !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, adminEmail, adminPassword, adminName } = body;

    if (!name || !adminEmail || !adminPassword || !adminName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tenant = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const newTenant = await tx.tenant.create({
        data: {
          name,
          subscriptionStatus: 'active',
          subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default 1 year
        }
      });

      // 2. Create initial Office Admin
      await tx.user.create({
        data: {
          tenantId: newTenant.id,
          name: adminName,
          email: adminEmail,
          password: hashPassword(adminPassword),
          role: 'ADMIN',
          mustChangePassword: true,
        }
      });

      return newTenant;
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Failed to create tenant:', error);
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}
