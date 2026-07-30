export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matterId } = await params;
    const session = await getSession('documents');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: { teamMembers: { select: { id: true } } }
    });

    if (!matter) {
      return NextResponse.json({ error: 'المشروع غير موجـودة' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (matter.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه المشروع' }, { status: 403 });
    }

    // Check matter access permission
    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    const isAssigned = matter.lawyerId === session.userId || matter.teamMembers.some(m => m.id === session.userId);

    if (!isManager && !isAssigned) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لملفات هذه المشروع' }, { status: 403 });
    }

    // Fetch active templates for the tenant
    const templates = await prisma.documentTemplate.findMany({
      where: {
        tenantId: session.tenantId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);

  } catch (error: any) {
    console.error('Error fetching matter templates:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب القوالب الخاصة بالمشروع.' }, { status: 500 });
  }
}
