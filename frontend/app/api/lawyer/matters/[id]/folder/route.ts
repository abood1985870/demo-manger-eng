import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hasPermission } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const matter = await prisma.matter.findUnique({
      where: { id: params.id, tenantId: session.tenantId },
      include: { teamMembers: true }
    });

    if (!matter) return NextResponse.json({ error: 'المشروع غير موجودة' }, { status: 404 });

    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    const isLawyerOrTeam = matter.lawyerId === session.userId || matter.teamMembers.some(m => m.id === session.userId);

    if (!isManager && !isLawyerOrTeam) {
      return NextResponse.json({ error: 'ليس لديك صلاحية لتعديل هذه المشروع' }, { status: 403 });
    }

    const { folderId } = await request.json();
    let finalFolderId = null;

    if (folderId && folderId !== 'none') {
      const folder = await prisma.caseFolder.findUnique({
        where: { id: folderId, tenantId: session.tenantId }
      });
      if (!folder) return NextResponse.json({ error: 'المجلد المختار غير صحيح' }, { status: 400 });

      if (!isManager && folder.createdById !== session.userId) {
        const viewerCheck = await prisma.caseFolder.findFirst({
          where: { id: folder.id, viewers: { some: { id: session.userId } } }
        });
        if (!viewerCheck) return NextResponse.json({ error: 'ليس لديك صلاحية لاستخدام هذا المجلد' }, { status: 403 });
      }
      finalFolderId = folder.id;
    }

    const updatedMatter = await prisma.matter.update({
      where: { id: matter.id },
      data: { folderId: finalFolderId }
    });

    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'matter.folder_changed',
      entityType: 'Matter',
      entityId: matter.id,
      metadata: { previousFolderId: matter.folderId, newFolderId: finalFolderId }
    });

    return NextResponse.json(updatedMatter);
  } catch (error) {
    console.error('Failed to change matter folder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
