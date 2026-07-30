export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { canManageMatter, getMatterForAuthorizedUser, validateActiveTenantUsers } from '@/lib/matter-access';
import { writeAuditLog } from '@/lib/audit';
import { PROJECT_STAGE_OPTIONS } from '@/lib/project-domain';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const matter = await getMatterForAuthorizedUser(session, id);
  if (!matter) return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });

  const detail = await prisma.matter.findFirst({
    where: { id: matter.id, tenantId: session.tenantId },
    include: { client: true, beneficiaryAccount: true, lawyer: true, folder: true, teamMembers: true, hearings: true, tasks: true, documents: true, invoices: true, developmentProfile: true, statusHistory: { include: { changedBy: true }, orderBy: { createdAt: 'desc' } }, statusUpdatedBy: true },
  });
  return NextResponse.json(detail);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const matter = await getMatterForAuthorizedUser(session, id);
    if (!matter) return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
    if (!canManageMatter(session, matter.lawyerId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await request.json();
    const title = data.title === undefined ? matter.title : String(data.title).trim();
    if (!title) return NextResponse.json({ error: 'Matter title cannot be empty' }, { status: 400 });
    const lawyerId = data.lawyerId === undefined ? matter.lawyerId : data.lawyerId || null;
    const stage = data.stage === undefined ? undefined : String(data.stage);
    if (stage !== undefined && !PROJECT_STAGE_OPTIONS.some((option) => option.value === stage)) {
      return NextResponse.json({ error: 'Invalid project stage' }, { status: 400 });
    }
    const beneficiaryAccountId = data.beneficiaryAccountId === undefined ? undefined : data.beneficiaryAccountId;
    if (beneficiaryAccountId !== undefined) {
      if (typeof beneficiaryAccountId !== 'string' || !beneficiaryAccountId) return NextResponse.json({ error: 'Beneficiary account is required.' }, { status: 400 });
      const beneficiaryAccount = await prisma.client.findFirst({ where: { id: beneficiaryAccountId, tenantId: session.tenantId } });
      if (!beneficiaryAccount) return NextResponse.json({ error: 'Invalid beneficiary account selected' }, { status: 400 });
    }
    if (lawyerId) {
      const lawyers = await validateActiveTenantUsers(session.tenantId, [lawyerId]);
      if (!lawyers || lawyers[0].role.toLowerCase() !== 'lawyer') {
        return NextResponse.json({ error: 'Invalid active lawyer selected' }, { status: 400 });
      }
    }

    const oldTeamIds = matter.teamMembers.map((member) => member.id);
    const requestedTeam = data.teamMemberIds === undefined ? oldTeamIds : data.teamMemberIds;
    if (!Array.isArray(requestedTeam)) return NextResponse.json({ error: 'Invalid case team' }, { status: 400 });
    const teamMemberIds = Array.from(new Set([...requestedTeam, ...(lawyerId === session.userId ? [] : [session.userId])]));
    const teamUsers = await validateActiveTenantUsers(session.tenantId, teamMemberIds);
    if (!teamUsers) return NextResponse.json({ error: 'Invalid or inactive case team member selected' }, { status: 400 });

    const updatedMatter = await prisma.matter.update({
      where: { id: matter.id },
      data: {
        title,
        caseNumber: data.caseNumber === undefined ? undefined : data.caseNumber?.trim() || null,
        lawyerId,
        beneficiaryAccountId,
        notes: data.notes === undefined ? undefined : data.notes?.trim() || null,
        teamMembers: { set: teamMemberIds.map((id) => ({ id })) },
        developmentProfile: stage === undefined ? undefined : {
          upsert: {
            create: {
              tenantId: session.tenantId,
              stage,
              projectCode: data.caseNumber === undefined ? matter.caseNumber : data.caseNumber?.trim() || null,
            },
            update: { stage },
          },
        },
      },
      include: { client: true, beneficiaryAccount: true, lawyer: true, folder: true, teamMembers: true, developmentProfile: true },
    });

    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'matter.updated',
      entityType: 'Matter',
      entityId: matter.id,
      metadata: { previousLawyerId: matter.lawyerId, lawyerId, previousTeamIds: oldTeamIds, teamMemberIds, stage },
    });

    const newlyAssigned = Array.from(new Set([lawyerId, ...teamMemberIds].filter((id): id is string => Boolean(id) && id !== session.userId)))
      .filter((id) => id !== matter.lawyerId && !oldTeamIds.includes(id));
    if (newlyAssigned.length) {
      await prisma.notification.createMany({ data: newlyAssigned.map((userId) => ({
        tenantId: session.tenantId, userId,
        title: 'تحديث فريق المشروع',
        message: `تم تعيينك في المشروع: ${updatedMatter.title}`,
        link: `/matters?matterId=${updatedMatter.id}`,
      })) });
    }
    return NextResponse.json(updatedMatter);
  } catch (error) {
    console.error('Failed to update matter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
