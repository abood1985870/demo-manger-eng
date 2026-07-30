export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { encrypt, hashPassword, verifyPassword, getSession } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'A current password and a new password of at least 8 characters are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !user.isActive || !verifyPassword(currentPassword, user.password)) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }
    if (currentPassword === newPassword) return NextResponse.json({ error: 'New password must be different from the current password.' }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashPassword(newPassword), mustChangePassword: false, sessionVersion: { increment: 1 } },
    });
    await writeAuditLog({ tenantId: updated.tenantId, userId: updated.id, action: 'user.password.changed', entityType: 'User', entityId: updated.id });

    const cookieStore = await cookies();
    const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const isSecureRequest = new URL(request.url).protocol === 'https:' || forwardedProtocol === 'https';
    const requireSecure = process.env.REQUIRE_SECURE_COOKIES === 'true';
    cookieStore.set('auth-session', await encrypt({
      userId: updated.id,
      tenantId: updated.tenantId,
      role: updated.role,
      sessionVersion: updated.sessionVersion,
      canCreateCase: updated.canCreateCase,
      modulePermissions: updated.modulePermissions,
    }), {
      httpOnly: true, secure: isSecureRequest || requireSecure, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60, path: '/',
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to change password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
