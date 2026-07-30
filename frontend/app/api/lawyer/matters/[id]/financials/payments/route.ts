export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkMatterAccess } from '@/lib/matter-access-control';
import { logAudit } from '@/lib/audit-logger';

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
      return NextResponse.json({ error: access.reason || 'غير مصرح لك بإضافة دفعات مالية لهذه المشروع' }, { status: 403 });
    }

    const body = await request.json();
    const { amount, paymentDate, method, reference, notes } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'يرجى إدخال قيمة الدفعة بشكل صحيح' }, { status: 400 });
    }

    const numAmount = Number(amount);

    const payment = await prisma.matterPayment.create({
      data: {
        matterId,
        tenantId: session.tenantId,
        amount: numAmount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        method: method || 'BANK_TRANSFER',
        reference: reference || null,
        notes: notes || null,
        receivedById: session.userId,
      },
      include: {
        receivedBy: { select: { id: true, name: true } }
      }
    });

    // Update payment status on fee agreement
    const feeAgreement = await prisma.matterFeeAgreement.findUnique({
      where: { matterId }
    });

    if (feeAgreement) {
      const allPayments = await prisma.matterPayment.findMany({
        where: { matterId, tenantId: session.tenantId }
      });
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

      let newStatus = 'UNPAID';
      if (totalPaid >= feeAgreement.totalFee && feeAgreement.totalFee > 0) {
        newStatus = 'PAID';
      } else if (totalPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      await prisma.matterFeeAgreement.update({
        where: { matterId },
        data: { paymentStatus: newStatus }
      });
    }

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_PAYMENT_ADD',
      entityType: 'MatterPayment',
      entityId: payment.id,
      metadata: { matterId, amount: numAmount, method: payment.method },
      req: request,
    });

    return NextResponse.json(payment, { status: 201 });

  } catch (error: any) {
    console.error('Error adding payment:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة الدفعة المالية.' }, { status: 500 });
  }
}
