import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

export async function PATCH(
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

    if (!matter) {
      return NextResponse.json({ error: 'المشروع غير موجـودة' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (matter.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه المشروع' }, { status: 403 });
    }

    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    const statusUpper = (matter.status || '').toUpperCase();
    const isFinalStatus = ['COMPLETED', 'CLOSED'].includes(statusUpper);

    // Rule: Cannot archive an active case (IN_PROGRESS, WAITING_CLIENT, UNDER_REVIEW) unless user is Manager/Admin with explicit reason
    if (!isFinalStatus && !isManager) {
      return NextResponse.json({
        error: 'لا يمكن أرشفة مشروع ما زال نشطاً إلا إذا كان مكتملاً أو مغلقاً، أو بواسطة مدير الشركة.'
      }, { status: 403 });
    }

    const body = await request.json();
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

    if (!reason) {
      return NextResponse.json({ error: 'يرجى تقديم سبب واضح لأرشفة المشروع' }, { status: 400 });
    }

    const updatedMatter = await prisma.matter.update({
      where: { id: matterId },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedById: session.userId,
        archiveReason: reason,
      },
      include: {
        client: true,
        lawyer: true,
        archivedBy: { select: { id: true, name: true } }
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_ARCHIVE',
      entityType: 'Matter',
      entityId: updatedMatter.id,
      metadata: { reason, previousStatus: matter.status },
      req: request,
    });

    return NextResponse.json({
      success: true,
      matter: updatedMatter,
      message: 'تمت أرشفة المشروع بنجاح'
    });

  } catch (error: any) {
    console.error('Error archiving matter:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء أرشفة المشروع.' }, { status: 500 });
  }
}
