import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    // Manager / Admin check
    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    if (!isManager) {
      return NextResponse.json({ error: 'اعتماد تجاوز تنبيه السجلات يقتصر على مدير الشركة أو مسؤول النظام' }, { status: 403 });
    }

    const body = await request.json();
    const { checkId, overrideReason } = body;

    if (!checkId) {
      return NextResponse.json({ error: 'معرف فحص التعارض مطلوب' }, { status: 400 });
    }

    const check = await prisma.matterConflictCheck.findUnique({
      where: { id: checkId }
    });

    if (!check || check.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'سجل الفحص غير موجود أو تابع لشركة أخرى' }, { status: 404 });
    }

    const updatedCheck = await prisma.matterConflictCheck.update({
      where: { id: checkId },
      data: {
        acknowledgedById: session.userId,
        acknowledgedAt: new Date(),
        reason: `${check.reason} | تم التجاوز والاعتماد بواسطة مدير الشركة: ${overrideReason || 'بدون ملاحظات إضافية'}`
      }
    });

    // Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'CONFLICT_CHECK_OVERRIDE',
      entityType: 'MatterConflictCheck',
      entityId: checkId,
      metadata: { checkedName: check.checkedName, overrideReason },
      req: request,
    });

    return NextResponse.json({
      success: true,
      check: updatedCheck,
      message: 'تم اعتماد وتجاوز تعارض المصالح بنجاح'
    });

  } catch (error: any) {
    console.error('Error acknowledging conflict check:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء اعتماد تجاوز تعارض المصالح.' }, { status: 500 });
  }
}
