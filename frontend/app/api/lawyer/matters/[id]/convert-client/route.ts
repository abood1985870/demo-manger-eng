import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { canManageMatter, getMatterForAuthorizedUser } from '@/lib/matter-access';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const matter = await getMatterForAuthorizedUser(session, id);

    if (!matter) {
      return NextResponse.json({ error: 'المشروع غير موجود أو لا تملك صلاحية الوصول إليه' }, { status: 404 });
    }

    if (!matter.externalPartyName) {
      return NextResponse.json({ error: 'لا توجد بيانات طرف خارجي لتحويلها إلى عميل' }, { status: 400 });
    }

    // Check permissions: only admins/owners/superadmins or responsible lawyer can edit/convert
    if (!canManageMatter(session, matter.lawyerId)) {
      return NextResponse.json({ error: 'لا تملك صلاحية تنفيذ هذا الإجراء' }, { status: 403 });
    }

    // Create client
    const newClient = await prisma.client.create({
      data: {
        tenantId: session.tenantId,
        name: matter.externalPartyName,
        phone: matter.externalPartyPhone || null,
        email: matter.externalPartyEmail || null,
        type: matter.externalPartyType || 'individual',
        status: 'active',
      },
    });

    // Update matter to link the client and clear/keep the external party fields
    const updatedMatter = await prisma.matter.update({
      where: { id },
      data: {
        clientId: newClient.id,
        // We clear the external party fields to convert completely, but keep notes if any
        externalPartyName: null,
        externalPartyPhone: null,
        externalPartyEmail: null,
        externalPartyType: null,
      },
      include: {
        client: true,
        lawyer: true,
        teamMembers: true,
      },
    });

    return NextResponse.json(updatedMatter);
  } catch (error) {
    console.error('Failed to convert external party to client:', error);
    return NextResponse.json({ error: 'تعذر تحويل الطرف الخارجي إلى عميل' }, { status: 500 });
  }
}
