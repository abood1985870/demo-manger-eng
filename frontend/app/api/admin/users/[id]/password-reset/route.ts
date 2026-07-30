import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

const officeManagerRoles = new Set(['admin', 'owner']);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { temporaryPassword } = await request.json();
    if (typeof temporaryPassword !== 'string' || temporaryPassword.length < 8) {
      return NextResponse.json({ error: 'Temporary password must be at least 8 characters.' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || !target.isActive) return NextResponse.json({ error: 'Active user not found.' }, { status: 404 });

    const role = session.role.toLowerCase();
    const officeManagerReset = officeManagerRoles.has(role) && target.tenantId === session.tenantId && target.role.toLowerCase() === 'lawyer';
    const systemManagerReset = role === 'superadmin' && officeManagerRoles.has(target.role.toLowerCase());
    if (!officeManagerReset && !systemManagerReset) return NextResponse.json({ error: 'You are not allowed to reset this user password.' }, { status: 403 });
    if (target.id === session.userId) return NextResponse.json({ error: 'Use the change password page for your own account.' }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { password: hashPassword(temporaryPassword), mustChangePassword: true, sessionVersion: { increment: 1 } },
    });
    await writeAuditLog({
      tenantId: updated.tenantId,
      userId: session.userId,
      action: 'user.password.reset',
      entityType: 'User',
      entityId: updated.id,
      metadata: { resetByRole: role, targetRole: target.role },
    });
    return NextResponse.json({ success: true, userId: updated.id, mustChangePassword: true });
  } catch (error) {
    console.error('Failed to reset password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
