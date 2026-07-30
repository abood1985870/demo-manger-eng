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

    // Unarchiving is strictly restricted to Office Managers / Admins
    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    if (!isManager) {
      return NextResponse.json({ error: 'صلاحية إلغاء الأرشفة تقتصر على مدير الشركة أو مسؤول النظام فقط.' }, { status: 403 });
    }

    const updatedMatter = await prisma.matter.update({
      where: { id: matterId },
      data: {
        isArchived: false,
        archivedAt: null,
        archivedById: null,
        archiveReason: null,
      },
      include: {
        client: true,
        lawyer: true,
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_UNARCHIVE',
      entityType: 'Matter',
      entityId: updatedMatter.id,
      metadata: { unarchivedBy: session.userId },
      req: request,
    });

    return NextResponse.json({
      success: true,
      matter: updatedMatter,
      message: 'تم إلغاء أرشفة المشروع وإعادتها للمشاريع النشطة بنجاح'
    });

  } catch (error: any) {
    console.error('Error unarchiving matter:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إلغاء أرشفة المشروع.' }, { status: 500 });
  }
}
