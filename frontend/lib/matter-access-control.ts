import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/auth';

export type RequiredMatterPermission =
  | 'view'
  | 'edit'
  | 'documents'
  | 'tasks'
  | 'hearings'
  | 'view_financials'
  | 'manage_financials'
  | 'manage_access';

export async function checkMatterAccess(
  session: { userId: string; tenantId: string; role: string },
  matterId: string,
  requiredPermission: RequiredMatterPermission = 'view'
): Promise<{ allowed: boolean; matter?: any; access?: any; reason?: string }> {
  // 1. Fetch matter with team and access list
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    include: {
      teamMembers: { select: { id: true } },
      accessList: { where: { userId: session.userId } }
    }
  });

  if (!matter) {
    return { allowed: false, reason: 'المشروع غير موجودة' };
  }

  // 2. Strict Tenant Isolation
  if (matter.tenantId !== session.tenantId) {
    return { allowed: false, reason: 'غير مصرح لك بالوصول لمشروع تابعة لشركة أخرى' };
  }

  // 3. Office Manager / Admin / Owner / SuperAdmin always have full access
  const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
  if (isManager) {
    return { allowed: true, matter };
  }

  // 4. Responsible Lawyer has full access
  if (matter.lawyerId === session.userId) {
    return { allowed: true, matter };
  }

  // 5. Check explicit MatterAccess record
  const access = matter.accessList[0];
  if (access) {
    let permOk = false;
    switch (requiredPermission) {
      case 'view':
        permOk = access.canView;
        break;
      case 'edit':
        permOk = access.canEdit;
        break;
      case 'documents':
        permOk = access.canManageDocuments;
        break;
      case 'tasks':
        permOk = access.canManageTasks;
        break;
      case 'hearings':
        permOk = access.canManageHearings;
        break;
      case 'view_financials':
        permOk = access.canViewFinancials;
        break;
      case 'manage_financials':
        permOk = access.canManageFinancials;
        break;
      case 'manage_access':
        permOk = access.accessRole === 'RESPONSIBLE_LAWYER';
        break;
    }

    if (!permOk) {
      return { allowed: false, matter, access, reason: 'ليس لديك الصلاحية اللازمة للقيام بهذا الإجراء داخل المشروع' };
    }
    return { allowed: true, matter, access };
  }

  // 6. Legacy fallback: Check if user is in teamMembers
  const isTeamMember = matter.teamMembers.some(m => m.id === session.userId);
  if (isTeamMember) {
    // Legacy team members have general access except financials management
    if (requiredPermission === 'view_financials' || requiredPermission === 'manage_financials' || requiredPermission === 'manage_access') {
      return { allowed: false, matter, reason: 'عرض أو إدارة المالية والصلاحيات مقتصرة على المصرح لهم' };
    }
    return { allowed: true, matter };
  }

  return { allowed: false, matter, reason: 'أنت لست عضواً في فريق العمل الخاص بهذه المشروع' };
}
