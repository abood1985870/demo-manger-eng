import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; accessId: string }> }
) {
  try {
    const { id: matterId, accessId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id: matterId }
    });

    if (!matter || matter.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'المشروع غير موجودة أو تابعة لشركة أخرى' }, { status: 404 });
    }

    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    const isResponsible = matter.lawyerId === session.userId;

    if (!isManager && !isResponsible) {
      return NextResponse.json({ error: 'تعديل صلاحيات المشروع يقتصر على مدير الشركة أو مدير المشروع المسؤول' }, { status: 403 });
    }

    const accessRecord = await prisma.matterAccess.findUnique({
      where: { id: accessId }
    });

    if (!accessRecord || accessRecord.matterId !== matterId || accessRecord.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'سجل الصلاحيات غير موجود أو غير تابع لهذه المشروع' }, { status: 404 });
    }

    const body = await request.json();
    const {
      accessRole,
      canView,
      canEdit,
      canManageDocuments,
      canManageTasks,
      canManageHearings,
      canViewFinancials,
      canManageFinancials
    } = body;

    const updatedAccess = await prisma.matterAccess.update({
      where: { id: accessId },
      data: {
        accessRole: accessRole !== undefined ? accessRole : accessRecord.accessRole,
        canView: canView !== undefined ? Boolean(canView) : accessRecord.canView,
        canEdit: canEdit !== undefined ? Boolean(canEdit) : accessRecord.canEdit,
        canManageDocuments: canManageDocuments !== undefined ? Boolean(canManageDocuments) : accessRecord.canManageDocuments,
        canManageTasks: canManageTasks !== undefined ? Boolean(canManageTasks) : accessRecord.canManageTasks,
        canManageHearings: canManageHearings !== undefined ? Boolean(canManageHearings) : accessRecord.canManageHearings,
        canViewFinancials: canViewFinancials !== undefined ? Boolean(canViewFinancials) : accessRecord.canViewFinancials,
        canManageFinancials: canManageFinancials !== undefined ? Boolean(canManageFinancials) : accessRecord.canManageFinancials,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_ACCESS_UPDATE',
      entityType: 'MatterAccess',
      entityId: accessId,
      metadata: { matterId, targetUserId: updatedAccess.userId, accessRole: updatedAccess.accessRole },
      req: request,
    });

    return NextResponse.json(updatedAccess);

  } catch (error: any) {
    console.error('Error updating matter access:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث صلاحيات المشروع.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; accessId: string }> }
) {
  try {
    const { id: matterId, accessId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id: matterId }
    });

    if (!matter || matter.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'المشروع غير موجودة أو تابعة لشركة أخرى' }, { status: 404 });
    }

    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    const isResponsible = matter.lawyerId === session.userId;

    if (!isManager && !isResponsible) {
      return NextResponse.json({ error: 'إزالة صلاحيات المشروع تقتصر على مدير الشركة أو مدير المشروع المسؤول' }, { status: 403 });
    }

    const accessRecord = await prisma.matterAccess.findUnique({
      where: { id: accessId }
    });

    if (!accessRecord || accessRecord.matterId !== matterId || accessRecord.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'سجل الصلاحيات غير موجود أو غير تابع لهذه المشروع' }, { status: 404 });
    }

    // Disconnect user from matter teamMembers
    await prisma.matter.update({
      where: { id: matterId },
      data: {
        teamMembers: {
          disconnect: { id: accessRecord.userId }
        }
      }
    });

    await prisma.matterAccess.delete({
      where: { id: accessId }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_ACCESS_REVOKE',
      entityType: 'MatterAccess',
      entityId: accessId,
      metadata: { matterId, targetUserId: accessRecord.userId },
      req: request,
    });

    return NextResponse.json({ success: true, message: 'تم إلغاء صلاحية المستخدم وإزالته من فريق المشروع بنجاح' });

  } catch (error: any) {
    console.error('Error deleting matter access:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إلغاء صلاحيات المشروع.' }, { status: 500 });
  }
}
