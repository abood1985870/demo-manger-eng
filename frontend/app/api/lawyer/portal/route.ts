import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hasPermission } from '@/lib/auth';
import { getMatterForAuthorizedUser } from '@/lib/matter-access';
import { writeAuditLog } from '@/lib/audit';
import { createPortalToken, hashPortalToken } from '@/lib/portal';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER']);
    const shares = await prisma.portalShare.findMany({
      where: {
        tenantId: session.tenantId,
        ...(isManager ? {} : { matter: { OR: [{ lawyerId: session.userId }, { teamMembers: { some: { id: session.userId } } }] } }),
      },
      include: { matter: { select: { id: true, title: true, status: true } }, client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(shares);
  } catch (error) {
    console.error('Failed to fetch portal shares:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { matterId, email, expiresInDays } = await request.json();
    if (!matterId || typeof email !== 'string' || !email.includes('@')) return NextResponse.json({ error: 'Matter and valid client email are required' }, { status: 400 });

    const matter = await getMatterForAuthorizedUser(session, String(matterId));
    if (!matter) return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
    const token = createPortalToken();
    const days = Math.min(Math.max(Number(expiresInDays) || 7, 1), 30);
    const share = await prisma.portalShare.create({
      data: { tenantId: session.tenantId, matterId: matter.id, clientId: matter.clientId, email: email.trim().toLowerCase(), tokenHash: hashPortalToken(token), expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000) },
      include: { matter: { select: { id: true, title: true, status: true } }, client: { select: { id: true, name: true } } },
    });
    await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'portal.share.created', entityType: 'PortalShare', entityId: share.id, metadata: { matterId: matter.id, expiresAt: share.expiresAt.toISOString() } });
    return NextResponse.json({ ...share, accessUrl: `${new URL(request.url).origin}/portal/access/${token}` }, { status: 201 });
  } catch (error) {
    console.error('Failed to create portal share:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await request.json();
    const share = await prisma.portalShare.findFirst({ where: { id, tenantId: session.tenantId } });
    if (!share) return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    const matter = await getMatterForAuthorizedUser(session, share.matterId);
    if (!matter || (!hasPermission(session.role, ['ADMIN', 'OWNER']) && matter.lawyerId !== session.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const revoked = await prisma.portalShare.update({ where: { id: share.id }, data: { revokedAt: new Date() } });
    await writeAuditLog({ tenantId: session.tenantId, userId: session.userId, action: 'portal.share.revoked', entityType: 'PortalShare', entityId: share.id });
    return NextResponse.json({ id: revoked.id, revokedAt: revoked.revokedAt });
  } catch (error) {
    console.error('Failed to revoke portal share:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
