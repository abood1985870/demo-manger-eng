export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPortalToken } from '@/lib/portal';

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const share = await prisma.portalShare.findFirst({
      where: { tokenHash: hashPortalToken(token), revokedAt: null, expiresAt: { gt: new Date() } },
      include: { client: { select: { name: true } }, matter: { select: { id: true, title: true, caseNumber: true, status: true, externalPartyName: true, notes: true, documents: { select: { id: true, title: true, type: true, createdAt: true } } } } },
    });
    if (!share) return NextResponse.json({ error: 'Share link is invalid or expired' }, { status: 404 });
    await prisma.portalShare.update({ where: { id: share.id }, data: { lastAccessAt: new Date() } });
    const origin = new URL(request.url).origin;
    return NextResponse.json({
      share: { id: share.id, email: share.email, expiresAt: share.expiresAt },
      matter: { ...share.matter, documents: share.matter.documents.map((document) => ({ ...document, downloadUrl: `${origin}/api/portal/access/${token}/documents/${document.id}` })) },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to open portal share:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
