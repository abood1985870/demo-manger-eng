export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hasPermission } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { validateActiveTenantUsers } from '@/lib/matter-access';

async function checkFolderAccess(folderId: string, session: any) {
  const folder = await prisma.caseFolder.findUnique({
    where: { id: folderId }
  });

  if (!folder) return { error: 'المجلد غير موجود', status: 404 };
  if (folder.tenantId !== session.tenantId) return { error: 'المجلد غير موجود', status: 404 }; // Hide existence

  const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
  if (!isManager && folder.createdById !== session.userId) {
    return { error: 'ليس لديك صلاحية لإدارة هذا المجلد', status: 403 };
  }

  return { folder };
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession('projects');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { folder, error, status } = await checkFolderAccess(params.id, session);
    if (error) return NextResponse.json({ error }, { status });

    const data = await request.json();
    const updateData: any = {};

    if (data.name !== undefined) {
      const name = typeof data.name === 'string' ? data.name.trim() : '';
      if (!name) return NextResponse.json({ error: 'اسم المجلد لا يمكن أن يكون فارغاً' }, { status: 400 });
      if (name.length > 100) return NextResponse.json({ error: 'اسم المجلد أطول من المسموح (100 حرف)' }, { status: 400 });
      
      const existing = await prisma.caseFolder.findFirst({
        where: { tenantId: session.tenantId, name: { equals: name }, id: { not: folder.id } }
      });
      if (existing) return NextResponse.json({ error: 'يوجد مجلد آخر بنفس الاسم' }, { status: 400 });
      
      updateData.name = name;
    }

    if (data.viewerIds !== undefined) {
      const viewerIds = Array.isArray(data.viewerIds) ? data.viewerIds : [];
      const validViewers = viewerIds.length > 0 ? await validateActiveTenantUsers(session.tenantId, viewerIds) : [];
      const validViewerIds = validViewers?.map(u => u.id) || [];
      const finalViewerIds = Array.from(new Set(validViewerIds)).filter(id => id !== folder.createdById);
      
      updateData.viewers = {
        set: finalViewerIds.map(id => ({ id }))
      };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(folder);
    }

    const updatedFolder = await prisma.caseFolder.update({
      where: { id: folder.id },
      data: updateData,
      include: {
        viewers: { select: { id: true, name: true, email: true, role: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      }
    });

    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'casefolder.updated',
      entityType: 'CaseFolder',
      entityId: folder.id,
      metadata: { originalName: folder.name, newName: updatedFolder.name }
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error('Failed to update folder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession('projects');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { folder, error, status } = await checkFolderAccess(params.id, session);
    if (error) return NextResponse.json({ error }, { status });

    // The onDelete: SetNull in schema handles matter folderId nullification safely
    await prisma.caseFolder.delete({
      where: { id: folder.id }
    });

    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'casefolder.deleted',
      entityType: 'CaseFolder',
      entityId: folder.id,
      metadata: { name: folder.name }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete folder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
