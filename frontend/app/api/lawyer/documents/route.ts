export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getMatterForAuthorizedUser } from '@/lib/matter-access';
import { deleteStoredDocument, storeDocument, validateDocumentFile } from '@/lib/document-storage';

export async function POST(request: Request) {
  try {
    const session = await getSession('documents');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const matterId = formData.get('matterId') as string;
    const file = formData.get('file');
    if (!matterId || !(file instanceof File)) return NextResponse.json({ error: 'Missing matterId or file' }, { status: 400 });

    const validationError = validateDocumentFile(file);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 415 });

    const matter = await getMatterForAuthorizedUser(session, matterId);
    if (!matter) return NextResponse.json({ error: 'Matter not found or unauthorized' }, { status: 404 });

    const { storageKey, safeName } = await storeDocument(session.tenantId, file.name, Buffer.from(await file.arrayBuffer()));
    try {
      const document = await prisma.document.create({ data: { matterId, title: safeName, fileUrl: storageKey, type: file.type } });
      return NextResponse.json({ ...document, fileUrl: undefined, downloadUrl: `/api/lawyer/documents/${document.id}/download` }, { status: 201 });
    } catch (error) {
      await deleteStoredDocument(storageKey).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    console.error('Failed to upload document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession('documents');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const matterId = new URL(request.url).searchParams.get('matterId');
    const matterFilter = ['admin', 'owner', 'superadmin'].includes(session.role.toLowerCase())
      ? { tenantId: session.tenantId }
      : { tenantId: session.tenantId, OR: [{ lawyerId: session.userId }, { teamMembers: { some: { id: session.userId } } }] };
    const documents = await prisma.document.findMany({
      where: { ...(matterId ? { matterId } : {}), matter: matterFilter },
      select: { id: true, matterId: true, title: true, type: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(documents.map((document) => ({ ...document, downloadUrl: `/api/lawyer/documents/${document.id}/download` })));
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession('documents');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });

    const document = await prisma.document.findUnique({ where: { id } });
    const matter = document ? await getMatterForAuthorizedUser(session, document.matterId) : null;
    if (!document || !matter) return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });

    // Delete the private file first so a failed filesystem operation never reports success.
    await deleteStoredDocument(document.fileUrl);
    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
