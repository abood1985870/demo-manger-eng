import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkMatterAccess } from '@/lib/matter-access-control';
import { logAudit } from '@/lib/audit-logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matterId } = await params;
    const session = await getSession('billing');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const access = await checkMatterAccess(session, matterId, 'view_financials');
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || 'غير مصرح لك باستعراض البيانات المالية لهذه المشروع' }, { status: 403 });
    }

    const feeAgreement = await prisma.matterFeeAgreement.findUnique({
      where: { matterId }
    });

    const payments = await prisma.matterPayment.findMany({
      where: {
        matterId,
        tenantId: session.tenantId,
      },
      include: {
        receivedBy: { select: { id: true, name: true } }
      },
      orderBy: { paymentDate: 'desc' }
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalFee = feeAgreement ? feeAgreement.totalFee : 0;
    const remainingBalance = Math.max(0, totalFee - totalPaid);

    return NextResponse.json({
      feeAgreement,
      payments,
      totalFee,
      totalPaid,
      remainingBalance,
      currency: feeAgreement?.currency || 'SAR',
      paymentStatus: feeAgreement?.paymentStatus || (totalFee > 0 ? (totalPaid >= totalFee ? 'PAID' : totalPaid > 0 ? 'PARTIALLY_PAID' : 'UNPAID') : 'UNPAID')
    });

  } catch (error: any) {
    console.error('Error fetching matter financials:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الميزانية والدفعات.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matterId } = await params;
    const session = await getSession('billing');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const access = await checkMatterAccess(session, matterId, 'manage_financials');
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || 'غير مصرح لك بإدارة ميزانية هذا المشروع' }, { status: 403 });
    }

    const body = await request.json();
    const { totalFee, currency, notes } = body;

    if (totalFee === undefined || isNaN(Number(totalFee)) || Number(totalFee) < 0) {
      return NextResponse.json({ error: 'يرجى إدخال الميزانية المعتمدة بشكل صحيح' }, { status: 400 });
    }

    const numFee = Number(totalFee);

    // Calculate current payments sum to determine status
    const existingPayments = await prisma.matterPayment.findMany({
      where: { matterId, tenantId: session.tenantId }
    });
    const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);

    let paymentStatus = 'UNPAID';
    if (totalPaid >= numFee && numFee > 0) {
      paymentStatus = 'PAID';
    } else if (totalPaid > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    const feeAgreement = await prisma.matterFeeAgreement.upsert({
      where: { matterId },
      create: {
        matterId,
        tenantId: session.tenantId,
        totalFee: numFee,
        currency: currency || 'SAR',
        paymentStatus,
        notes: notes || null,
      },
      update: {
        totalFee: numFee,
        currency: currency || 'SAR',
        paymentStatus,
        notes: notes !== undefined ? notes : undefined,
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_FEE_AGREEMENT_SET',
      entityType: 'MatterFeeAgreement',
      entityId: feeAgreement.id,
      metadata: { matterId, totalFee: numFee, paymentStatus },
      req: request,
    });

    return NextResponse.json(feeAgreement);

  } catch (error: any) {
    console.error('Error setting fee agreement:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ بيانات الميزانية.' }, { status: 500 });
  }
}
