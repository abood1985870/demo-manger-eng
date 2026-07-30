import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hashPassword, hasPermission } from '@/lib/auth';
import { DEFAULT_TEAM_MEMBER_PERMISSIONS, MODULE_PERMISSION_KEYS } from '@/lib/module-permissions';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, ['ADMIN', 'OWNER'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const users = await prisma.user.findMany({
      where: session.role.toLowerCase() === 'superadmin' ? {} : { tenantId: session.tenantId },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mfaEnabled: true,
        canCreateCase: true,
        modulePermissions: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        tenant: { select: { id: true, name: true, domain: true } },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, ['ADMIN', 'OWNER'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { name, email, role, password, tenantId, modulePermissions } = await request.json();

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const actualTenantId = session.tenantId;
    if (tenantId && tenantId !== actualTenantId) return NextResponse.json({ error: 'Tenant mismatch' }, { status: 403 });

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        role,
        tenantId: actualTenantId,
        modulePermissions: JSON.stringify(Object.fromEntries(
          MODULE_PERMISSION_KEYS.map((key) => [
            key,
            typeof modulePermissions?.[key] === 'boolean'
              ? modulePermissions[key]
              : DEFAULT_TEAM_MEMBER_PERMISSIONS[key],
          ]),
        )),
      }
    });

    const { password: _, mfaSecret: __, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
