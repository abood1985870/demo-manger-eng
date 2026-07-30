import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkMatterAccess } from '@/lib/matter-access-control';
import { logAudit } from '@/lib/audit-logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matterId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const accessCheck = await checkMatterAccess(session, matterId, 'view');
    if (!accessCheck.allowed) {
      return NextResponse.json({ error: accessCheck.reason || 'غير مصرح لك بالوصول لهذه المشروع' }, { status: 403 });
    }

    const accessList = await prisma.matterAccess.findMany({
      where: {
        matterId,
        tenantId: session.tenantId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(accessList);

  } catch (error: any) {
    console.error('Error fetching matter access list:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب فريق وصلاحيات المشروع.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matterId } = await params;
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
      return NextResponse.json({ error: 'إدارة فريق وصلاحيات المشروع تقتصر على مدير الشركة أو مدير المشروع المسؤول' }, { status: 403 });
    }

    const body = await request.json();
    const {
      userId,
      accessRole,
      canView,
      canEdit,
      canManageDocuments,
      canManageTasks,
      canManageHearings,
      canViewFinancials,
      canManageFinancials
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'يرجى اختيار المستخدم المراد منح الصلاحية له' }, { status: 400 });
    }

    // Verify user belongs to same tenant
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser || targetUser.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'المستخدم غير موجود أو تابع لشركة أخرى' }, { status: 404 });
    }

    const accessRecord = await prisma.matterAccess.upsert({
      where: {
        matterId_userId: { matterId, userId }
      },
      create: {
        matterId,
        tenantId: session.tenantId,
        userId,
        accessRole: accessRole || 'ASSIGNED_LAWYER',
        canView: canView !== undefined ? Boolean(canView) : true,
        canEdit: canEdit !== undefined ? Boolean(canEdit) : true,
        canManageDocuments: canManageDocuments !== undefined ? Boolean(canManageDocuments) : true,
        canManageTasks: canManageTasks !== undefined ? Boolean(canManageTasks) : true,
        canManageHearings: canManageHearings !== undefined ? Boolean(canManageHearings) : true,
        canViewFinancials: canViewFinancials !== undefined ? Boolean(canViewFinancials) : false,
        canManageFinancials: canManageFinancials !== undefined ? Boolean(canManageFinancials) : false,
        createdById: session.userId,
      },
      update: {
        accessRole: accessRole || 'ASSIGNED_LAWYER',
        canView: canView !== undefined ? Boolean(canView) : true,
        canEdit: canEdit !== undefined ? Boolean(canEdit) : false,
        canManageDocuments: canManageDocuments !== undefined ? Boolean(canManageDocuments) : true,
        canManageTasks: canManageTasks !== undefined ? Boolean(canManageTasks) : true,
        canManageHearings: canManageHearings !== undefined ? Boolean(canManageHearings) : true,
        canViewFinancials: canViewFinancials !== undefined ? Boolean(canViewFinancials) : false,
        canManageFinancials: canManageFinancials !== undefined ? Boolean(canManageFinancials) : false,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    // Sync with teamMembers relation
    await prisma.matter.update({
      where: { id: matterId },
      data: {
        teamMembers: {
          connect: { id: userId }
        }
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_ACCESS_GRANT',
      entityType: 'MatterAccess',
      entityId: accessRecord.id,
      metadata: { matterId, targetUserId: userId, accessRole: accessRecord.accessRole },
      req: request,
    });

    return NextResponse.json(accessRecord, { status: 201 });

  } catch (error: any) {
    console.error('Error granting matter access:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء منح الصلاحيات داخل المشروع.' }, { status: 500 });
  }
}
