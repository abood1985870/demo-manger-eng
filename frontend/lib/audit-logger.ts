import { prisma } from './db';

export interface AuditLogOptions {
  tenantId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any> | string;
  req?: Request;
}

export async function logAudit(options: AuditLogOptions) {
  try {
    const { tenantId, userId, action, entityType, entityId, metadata, req } = options;
    
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (req) {
      ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
      userAgent = req.headers.get('user-agent') || null;
    }

    const metadataString = typeof metadata === 'object' ? JSON.stringify(metadata) : metadata || null;

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: userId || null,
        action,
        entityType,
        entityId: entityId || null,
        metadata: metadataString,
        ipAddress,
        userAgent,
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
