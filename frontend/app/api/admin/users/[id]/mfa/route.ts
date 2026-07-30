import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hasPermission } from '@/lib/auth';
import { createOtpAuthUri, generateMfaSecret, verifyTotp } from '@/lib/mfa';
import { writeAuditLog } from '@/lib/audit';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, ['ADMIN', 'OWNER'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const user = await prisma.user.findFirst({ where: { id, tenantId: session.tenantId }, select: { id: true, email: true, mfaEnabled: true, mfaSecret: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { action, code } = await request.json();
    if (action === 'setup') {
      const secret = generateMfaSecret();
      await prisma.user.update({ where: { id: user.id }, data: { mfaSecret: secret, mfaEnabled: false } });
      return NextResponse.json({ mfaEnabled: false, secret, otpauthUri: createOtpAuthUri(secret, user.email) });
    }

    if (action === 'enable') {
      if (!user.mfaSecret || !verifyTotp(user.mfaSecret, String(code || ''))) return NextResponse.json({ error: 'Invalid MFA code' }, { status: 400 });
      await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: true } });
      await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'user.mfa.enabled', entityType: 'User', entityId: user.id });
      return NextResponse.json({ mfaEnabled: true });
    }

    return NextResponse.json({ error: 'Unsupported MFA action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to configure MFA:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, ['ADMIN', 'OWNER'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const user = await prisma.user.findFirst({ where: { id, tenantId: session.tenantId }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: false, mfaSecret: null } });
    await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'user.mfa.disabled', entityType: 'User', entityId: user.id });
    return NextResponse.json({ mfaEnabled: false });
  } catch (error) {
    console.error('Failed to disable MFA:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
