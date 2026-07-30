import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPortalToken } from '@/lib/portal';
import { documentContentType, readStoredDocument, sanitizeDocumentName } from '@/lib/document-storage';

export async function GET(_: Request, { params }: { params: Promise<{ token: string; documentId: string }> }) {
  try {
    const { token, documentId } = await params;
    const share = await prisma.portalShare.findFirst({ where: { tokenHash: hashPortalToken(token), revokedAt: null, expiresAt: { gt: new Date() } }, select: { matterId: true } });
    if (!share) return NextResponse.json({ error: 'Share link is invalid or expired' }, { status: 404 });
    const document = await prisma.document.findFirst({ where: { id: documentId, matterId: share.matterId } });
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    const filename = sanitizeDocumentName(document.title);
    const content = await readStoredDocument(document.fileUrl);
    return new NextResponse(content, { headers: { 'Content-Type': documentContentType(document.type, filename), 'Content-Disposition': `inline; filename="${filename}"`, 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Failed to download portal document:', error);
    return NextResponse.json({ error: 'Document unavailable' }, { status: 404 });
  }
}
