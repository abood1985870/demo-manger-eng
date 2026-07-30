import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hasPermission } from '@/lib/auth';
import { canManageMatter, getMatterForAuthorizedUser } from '@/lib/matter-access';
import { writeAuditLog } from '@/lib/audit';
import { COMPLIANCE_STATUS_OPTIONS, PROJECT_COMPLIANCE_FIELDS } from '@/lib/project-domain';

const allowedStatuses = new Set(COMPLIANCE_STATUS_OPTIONS.map((option) => option.value));
const allowedFields = new Set(PROJECT_COMPLIANCE_FIELDS.map((field) => field.key));

export async function GET() {
  try {
    const session = await getSession('compliance');
    if (!session) return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });

    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    const projects = await prisma.matter.findMany({
      where: {
        tenantId: session.tenantId,
        isArchived: false,
        ...(isManager ? {} : { OR: [{ lawyerId: session.userId }, { teamMembers: { some: { id: session.userId } } }] }),
      },
      select: {
        id: true,
        title: true,
        caseNumber: true,
        lawyer: { select: { name: true } },
        developmentProfile: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch project compliance:', error);
    return NextResponse.json({ error: 'تعذر تحميل متطلبات المشاريع' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession('compliance');
    if (!session) return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });

    const data = await request.json();
    const matterId = typeof data.matterId === 'string' ? data.matterId : '';
    const field = typeof data.field === 'string' ? data.field : '';
    const value = typeof data.value === 'string' ? data.value : '';
    if (!matterId || !allowedFields.has(field as never) || !allowedStatuses.has(value as never)) {
      return NextResponse.json({ error: 'بيانات التحديث غير صحيحة' }, { status: 400 });
    }

    const matter = await getMatterForAuthorizedUser(session, matterId);
    if (!matter) return NextResponse.json({ error: 'المشروع غير موجود أو لا تملك صلاحية الوصول' }, { status: 404 });
    if (!canManageMatter(session, matter.lawyerId)) {
      return NextResponse.json({ error: 'لا تملك صلاحية تعديل بوابات المشروع' }, { status: 403 });
    }

    const profile = await prisma.developmentProjectProfile.upsert({
      where: { matterId },
      create: {
        tenantId: session.tenantId,
        matterId,
        [field]: value,
      },
      update: { [field]: value },
    });

    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'project.compliance.updated',
      entityType: 'DevelopmentProjectProfile',
      entityId: profile.id,
      metadata: { matterId, field, value },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to update project compliance:', error);
    return NextResponse.json({ error: 'تعذر تحديث متطلب المشروع' }, { status: 500 });
  }
}
