export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkMatterAccess } from '@/lib/matter-access-control';
import { logAudit } from '@/lib/audit-logger';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; partyId: string }> }
) {
  try {
    const { id: matterId, partyId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const access = await checkMatterAccess(session, matterId, 'edit');
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || 'غير مصرح لك بتعديل أطراف هذه المشروع' }, { status: 403 });
    }

    const party = await prisma.matterParty.findUnique({
      where: { id: partyId }
    });

    if (!party || party.matterId !== matterId || party.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'الطرف غير موجود أو غير تابع لهذه المشروع' }, { status: 404 });
    }

    const body = await request.json();
    const { name, partyType, role, nationalIdOrCr, phone, email, address, notes } = body;

    const updatedParty = await prisma.matterParty.update({
      where: { id: partyId },
      data: {
        name: name !== undefined ? name.trim() : party.name,
        partyType: partyType !== undefined ? partyType : party.partyType,
        role: role !== undefined ? role : party.role,
        nationalIdOrCr: nationalIdOrCr !== undefined ? nationalIdOrCr : party.nationalIdOrCr,
        phone: phone !== undefined ? phone : party.phone,
        email: email !== undefined ? email : party.email,
        address: address !== undefined ? address : party.address,
        notes: notes !== undefined ? notes : party.notes,
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_PARTY_UPDATE',
      entityType: 'MatterParty',
      entityId: partyId,
      metadata: { matterId, partyName: updatedParty.name, role: updatedParty.role },
      req: request,
    });

    return NextResponse.json(updatedParty);

  } catch (error: any) {
    console.error('Error updating matter party:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث بيانات الطرف.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; partyId: string }> }
) {
  try {
    const { id: matterId, partyId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const access = await checkMatterAccess(session, matterId, 'edit');
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || 'غير مصرح لك بحذف أطراف من هذه المشروع' }, { status: 403 });
    }

    const party = await prisma.matterParty.findUnique({
      where: { id: partyId }
    });

    if (!party || party.matterId !== matterId || party.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'الطرف غير موجود أو غير تابع لهذه المشروع' }, { status: 404 });
    }

    await prisma.matterParty.delete({
      where: { id: partyId }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'MATTER_PARTY_DELETE',
      entityType: 'MatterParty',
      entityId: partyId,
      metadata: { matterId, deletedName: party.name },
      req: request,
    });

    return NextResponse.json({ success: true, message: 'تم حذف الطرف بنجاح' });

  } catch (error: any) {
    console.error('Error deleting matter party:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الطرف من المشروع.' }, { status: 500 });
  }
}
