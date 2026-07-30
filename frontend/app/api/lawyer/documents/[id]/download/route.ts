export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getMatterForAuthorizedUser } from '@/lib/matter-access';
import { documentContentType, readStoredDocument, sanitizeDocumentName } from '@/lib/document-storage';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession('documents');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const document = await prisma.document.findUnique({ where: { id } });
    const matter = document ? await getMatterForAuthorizedUser(session, document.matterId) : null;
    if (!document || !matter) return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });

    const filename = sanitizeDocumentName(document.title);
    return new NextResponse(await readStoredDocument(document.fileUrl), { headers: {
      'Content-Type': documentContentType(document.type, filename),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    } });
  } catch (error) {
    console.error('Failed to download document:', error);
    return NextResponse.json({ error: 'Document unavailable' }, { status: 404 });
  }
}
