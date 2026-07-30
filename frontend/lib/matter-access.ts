import { prisma } from './db';
import type { SessionPayload } from './auth';
import { hasModulePermission } from './module-permissions';

export const MATTER_MANAGER_ROLES = ['superadmin', 'admin', 'owner'];

export async function getMatterForMember(session: SessionPayload, matterId: string) {
  const matter = await prisma.matter.findFirst({
    where: {
      id: matterId,
      tenantId: session.tenantId,
      OR: [
        { lawyerId: session.userId },
        { teamMembers: { some: { id: session.userId } } },
      ],
    },
    include: { teamMembers: true },
  });

  return matter;
}

export async function getMatterForAuthorizedUser(session: SessionPayload, matterId: string) {
  if (!hasModulePermission(session.role, session.modulePermissions, 'projects')) return null;
  const memberMatter = await getMatterForMember(session, matterId);
  if (memberMatter) return memberMatter;
  if (!MATTER_MANAGER_ROLES.includes(session.role.toLowerCase())) return null;

  return prisma.matter.findFirst({
    where: { id: matterId, tenantId: session.tenantId },
    include: { teamMembers: true },
  });
}

export function canManageMatter(session: SessionPayload, lawyerId: string | null) {
  return MATTER_MANAGER_ROLES.includes(session.role.toLowerCase()) || lawyerId === session.userId;
}

export async function validateActiveTenantUsers(tenantId: string, userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: uniqueIds }, tenantId, isActive: true },
    select: { id: true, role: true },
  });

  if (users.length !== uniqueIds.length) return null;
  return users;
}
