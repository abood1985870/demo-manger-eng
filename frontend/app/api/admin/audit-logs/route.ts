export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    // Role check: Only Admin / Owner / Superadmin can view audit logs
    const roleUpper = (session.role || '').toUpperCase();
    const isManager = ['ADMIN', 'OWNER', 'SUPERADMIN'].includes(roleUpper);

    if (!isManager) {
      return NextResponse.json({ error: 'غير مصرح لك باستعراض سجلات التدقيق والرقابة' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');

    const where: any = {
      tenantId: session.tenantId,
    };

    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(logs);

  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب سجلات التدقيق.' }, { status: 500 });
  }
}
