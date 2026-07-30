export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hasPermission, CREATE_CASE } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { MODULE_PERMISSION_KEYS, parseModulePermissions } from '@/lib/module-permissions';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, ['ADMIN', 'OWNER'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const { permission, enabled, module } = await request.json();
    if (typeof enabled !== 'boolean') return NextResponse.json({ error: 'Permission value must be boolean.' }, { status: 400 });

    const user = await prisma.user.findFirst({ where: { id, tenantId: session.tenantId } });
    if (!user) return NextResponse.json({ error: 'User not found or unauthorized.' }, { status: 404 });
    if (user.role.toLowerCase() !== 'lawyer') return NextResponse.json({ error: 'Employee permissions can only be changed for project team members.' }, { status: 400 });

    if (permission === 'MODULE_ACCESS') {
      if (!MODULE_PERMISSION_KEYS.includes(module)) return NextResponse.json({ error: 'Unsupported module permission.' }, { status: 400 });
      const modulePermissions = parseModulePermissions(user.modulePermissions, user.role);
      modulePermissions[module] = enabled;
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { modulePermissions: JSON.stringify(modulePermissions), sessionVersion: { increment: 1 } },
      });
      await writeAuditLog({
        tenantId: session.tenantId,
        userId: session.userId,
        action: 'user.module_permission.updated',
        entityType: 'User',
        entityId: user.id,
        metadata: { module, enabled },
      });
      return NextResponse.json({ id: updated.id, modulePermissions: updated.modulePermissions });
    }

    if (permission !== CREATE_CASE) return NextResponse.json({ error: 'Unsupported permission update.' }, { status: 400 });

    const updated = await prisma.user.update({ where: { id: user.id }, data: { canCreateCase: enabled, sessionVersion: { increment: 1 } } });
    await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'user.permission.updated', entityType: 'User', entityId: user.id, metadata: { permission: CREATE_CASE, enabled } });
    return NextResponse.json({ id: updated.id, canCreateCase: updated.canCreateCase });
  } catch (error) {
    console.error('Failed to update user permission:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
