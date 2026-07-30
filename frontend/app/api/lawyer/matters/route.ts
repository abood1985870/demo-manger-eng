import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { canCreateCase, getSession, hasPermission } from '@/lib/auth';
import { validateActiveTenantUsers } from '@/lib/matter-access';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const session = await getSession('projects');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const lawyerId = searchParams.get('lawyerId');
    const folderId = searchParams.get('folderId');
    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    const whereClause: any = {
      tenantId: session.tenantId,
      ...(lawyerId ? { lawyerId } : {}),
      ...(isManager ? {} : { OR: [{ lawyerId: session.userId }, { teamMembers: { some: { id: session.userId } } }] }),
    };

    if (folderId !== null) {
      whereClause.folderId = folderId === 'none' ? null : folderId;
    }

    const matters = await prisma.matter.findMany({
      where: whereClause,
      include: { client: true, beneficiaryAccount: true, lawyer: true, folder: true, hearings: true, tasks: true, documents: true, invoices: true, teamMembers: true, developmentProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const enrichedMatters = matters.map((m) => {
      const openTasksCount = m.tasks.filter((t) => !t.isDone && t.status !== 'DONE' && t.status !== 'CANCELLED').length;
      const overdueTasksCount = m.tasks.filter((t) => !t.isDone && t.dueDate && new Date(t.dueDate) < now).length;

      // Find upcoming hearings/appointments sorted by date
      const futureHearings = m.hearings
        .filter((h) => new Date(h.date) >= new Date(now.valueOf() - 60000))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const nextAppointment = futureHearings.length > 0 ? futureHearings[0] : null;
      const hasUpcomingAppointmentWithin3Days = nextAppointment
        ? new Date(nextAppointment.date) <= threeDaysFromNow
        : false;

      return {
        ...m,
        openTasksCount,
        overdueTasksCount,
        nextAppointment,
        hasUpcomingAppointmentWithin3Days,
      };
    });

    return NextResponse.json(enrichedMatters);
  } catch (error) {
    console.error('Failed to fetch matters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession('projects');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canCreateCase(session)) return NextResponse.json({ error: 'Forbidden: CREATE_CASE permission is required.' }, { status: 403 });

    const data = await request.json();
    const title = typeof data.title === 'string' ? data.title.trim() : '';
    if (!title) return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 });
    const beneficiaryAccountId = typeof data.beneficiaryAccountId === 'string' && data.beneficiaryAccountId.trim() !== '' ? data.beneficiaryAccountId : null;
    if (beneficiaryAccountId) {
      const beneficiaryAccount = await prisma.client.findFirst({ where: { id: beneficiaryAccountId, tenantId: session.tenantId } });
      if (!beneficiaryAccount) return NextResponse.json({ error: 'Invalid beneficiary account selected' }, { status: 400 });
    }

    const lawyerId = data.lawyerId || null;
    if (lawyerId) {
      const lawyers = await validateActiveTenantUsers(session.tenantId, [lawyerId]);
      if (!lawyers || lawyers[0].role.toLowerCase() !== 'lawyer') {
        return NextResponse.json({ error: 'Invalid active lawyer selected' }, { status: 400 });
      }
    }

    const requestedTeam = Array.isArray(data.teamMemberIds) ? data.teamMemberIds : [];
    // The creator must retain access even when they are not the responsible lawyer.
    const teamMemberIds = Array.from(new Set([...requestedTeam, ...(lawyerId === session.userId ? [] : [session.userId])]));
    const teamUsers = await validateActiveTenantUsers(session.tenantId, teamMemberIds);
    if (!teamUsers) return NextResponse.json({ error: 'Invalid or inactive case team member selected' }, { status: 400 });

    if (data.clientId) {
      const client = await prisma.client.findFirst({ where: { id: data.clientId, tenantId: session.tenantId } });
      if (!client) return NextResponse.json({ error: 'Invalid client selected' }, { status: 400 });
    }
    
    let validFolderId = null;
    if (data.folderId) {
      const folder = await prisma.caseFolder.findFirst({
        where: { id: data.folderId, tenantId: session.tenantId }
      });
      if (!folder) return NextResponse.json({ error: 'المجلد المختار غير صحيح أو غير موجود' }, { status: 400 });
      
      const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
      if (!isManager && folder.createdById !== session.userId) {
        const viewerCheck = await prisma.caseFolder.findFirst({
          where: { id: folder.id, viewers: { some: { id: session.userId } } }
        });
        if (!viewerCheck) return NextResponse.json({ error: 'ليس لديك صلاحية لوضع المشروع في هذا المجلد' }, { status: 403 });
      }
      validFolderId = folder.id;
    }

    const newMatter = await prisma.matter.create({
      data: {
        tenantId: session.tenantId,
        title,
        caseNumber: data.caseNumber?.trim() || null,
        lawyerId,
        clientId: data.clientId || null,
        beneficiaryAccountId,
        folderId: validFolderId,
        status: 'NEW',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        externalPartyName: data.externalPartyName?.trim() || null,
        externalPartyType: data.externalPartyType || null,
        externalPartyPhone: data.externalPartyPhone?.trim() || null,
        externalPartyEmail: data.externalPartyEmail?.trim() || null,
        externalPartyNotes: data.externalPartyNotes?.trim() || null,
        notes: data.notes?.trim() || null,
        teamMembers: { connect: teamMemberIds.map((id: string) => ({ id })) },
        developmentProfile: {
          create: {
            tenantId: session.tenantId,
            projectCode: data.caseNumber?.trim() || null,
            city: data.city?.trim() || null,
            region: data.region?.trim() || null,
            stage: data.stage || 'PLANNING',
            plannedStart: data.plannedStart ? new Date(data.plannedStart) : null,
            plannedEnd: data.dueDate ? new Date(data.dueDate) : null,
            projectValue: Number(data.projectValue) || 0,
            budgetAtCompletion: Number(data.budgetAtCompletion) || 0,
            plannedValue: Number(data.plannedValue) || 0,
            earnedValue: Number(data.earnedValue) || 0,
            actualCost: Number(data.actualCost) || 0,
            totalUnits: Math.max(0, Number.parseInt(data.totalUnits, 10) || 0),
            soldUnits: Math.max(0, Number.parseInt(data.soldUnits, 10) || 0),
            collectedAmount: Number(data.collectedAmount) || 0,
          },
        },
      },
      include: { client: true, beneficiaryAccount: true, lawyer: true, folder: true, teamMembers: true, developmentProfile: true },
    });

    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'matter.created',
      entityType: 'Matter',
      entityId: newMatter.id,
      metadata: { lawyerId, teamMemberIds, clientId: data.clientId || null, beneficiaryAccountId },
    });

    const notifyIds = Array.from(new Set([lawyerId, ...teamMemberIds].filter((id): id is string => Boolean(id) && id !== session.userId)));
    if (notifyIds.length) {
      await prisma.notification.createMany({ data: notifyIds.map((userId) => ({
        tenantId: session.tenantId, userId,
        title: 'مشروع جديد',
        message: `تمت إضافتك إلى فريق المشروع: ${newMatter.title}`,
        link: `/matters?matterId=${newMatter.id}`,
      })) });
    }
    return NextResponse.json(newMatter, { status: 201 });
  } catch (error) {
    console.error('Failed to create matter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
