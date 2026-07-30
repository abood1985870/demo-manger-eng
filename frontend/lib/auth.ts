import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './db';
import { hasModulePermission, ModulePermissionKey } from './module-permissions';
export { hashPassword, verifyPassword } from './password';

function getSecretKey() {
  const configuredSecret = process.env.JWT_SECRET;
  if (!configuredSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production');
  }
  return configuredSecret || 'a-very-secure-fallback-secret-for-development-only';
}

export type Role = 'OWNER' | 'ADMIN' | 'LAWYER' | 'ASSISTANT' | 'ACCOUNTANT' | 'RECEPTIONIST' | 'READ_ONLY';

export type SessionPayload = {
  userId: string;
  tenantId: string;
  role: Role | string;
  sessionVersion?: number;
  canCreateCase?: boolean;
  modulePermissions?: string;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(getSecretKey()));
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, new TextEncoder().encode(getSecretKey()), {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession(requiredModule?: ModulePermissionKey) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth-session')?.value;
  
  if (!sessionCookie) return null;

  const payload = await decrypt(sessionCookie);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || !user.isActive || user.tenantId !== payload.tenantId || (payload.sessionVersion ?? 0) !== user.sessionVersion) {
      return null;
    }
    if (requiredModule && !hasModulePermission(user.role, user.modulePermissions, requiredModule)) return null;

    // Role could be enforced here if it was revoked recently
    return {
      userId: user.id,
      tenantId: user.tenantId,
      name: user.name,
      role: user.role,
      sessionVersion: user.sessionVersion,
      canCreateCase: user.canCreateCase,
      modulePermissions: user.modulePermissions,
    };
  } catch (e) {
    return null;
  }
}

// Basic RBAC implementation
export function hasPermission(userRole: string, requiredRoles: string[]) {
  const role = userRole.toUpperCase();
  const allowed = requiredRoles.map((requiredRole) => requiredRole.toUpperCase());
  if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || role === 'OWNER') return true;
  return allowed.includes(role);
}

export const CREATE_CASE = 'CREATE_CASE';

export function canCreateCase(session: SessionPayload) {
  return hasPermission(session.role, ['ADMIN', 'OWNER']) || session.canCreateCase === true;
}
