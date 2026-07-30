import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

const COMPLETED_STATUSES = new Set(['COMPLETED', 'CLOSED', 'ARCHIVED']);

function ratio(numerator: number, denominator: number) {
  return denominator > 0 ? Number((numerator / denominator).toFixed(2)) : null;
}

function projectHealth(spi: number | null, cpi: number | null, overdueTasks: number) {
  if (overdueTasks > 0 || (spi !== null && spi < 0.85) || (cpi !== null && cpi < 0.85)) {
    return 'DELAYED';
  }
  if ((spi !== null && spi < 0.95) || (cpi !== null && cpi < 0.95)) {
    return 'WATCH';
  }
  return 'ON_TRACK';
}

export async function GET() {
  try {
    const session = await getSession('dashboard');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }
    if (!session.tenantId) {
      return NextResponse.json({ error: 'معرّف الشركة غير متوفر' }, { status: 403 });
    }

    const tenantId = session.tenantId;
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [tenant, allMatters, overdueTasksCount, upcomingMilestones, totalClientsCount, activeUsers] =
      await Promise.all([
        prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
        prisma.matter.findMany({
          where: { tenantId },
          include: {
            lawyer: { select: { id: true, name: true, role: true } },
            tasks: { select: { id: true, isDone: true, dueDate: true, status: true, userId: true } },
            hearings: { select: { id: true, date: true, title: true, court: true } },
            developmentProfile: true,
          },
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.task.count({
          where: { tenantId, isDone: false, dueDate: { lt: now } },
        }),
        prisma.hearing.findMany({
          where: { tenantId, date: { gte: new Date(now.getTime() - 60_000) } },
          include: { matter: { select: { id: true, title: true, caseNumber: true } } },
          orderBy: { date: 'asc' },
          take: 5,
        }),
        prisma.client.count({ where: { tenantId } }),
        prisma.user.findMany({
          where: { tenantId, isActive: true },
          select: { id: true, name: true, email: true, role: true },
        }),
      ]);

    let openMattersCount = 0;
    let completedMattersCount = 0;
    let archivedMattersCount = 0;
    let waitingClientMattersCount = 0;
    let underReviewMattersCount = 0;
    let inProgressMattersCount = 0;

    const mattersNeedingAttention: Array<Record<string, unknown>> = [];
    const alerts: Array<Record<string, unknown>> = [];

    const projects = allMatters.map((matter) => {
      const status = (matter.status || '').toUpperCase();
      const isArchived = matter.isArchived || status === 'ARCHIVED';
      const profile = matter.developmentProfile;
      const openTasks = matter.tasks.filter((task) => !task.isDone);
      const overdueTasks = openTasks.filter(
        (task) => task.dueDate && new Date(task.dueDate) < now,
      ).length;

      if (isArchived) archivedMattersCount += 1;
      else if (COMPLETED_STATUSES.has(status)) completedMattersCount += 1;
      else openMattersCount += 1;

      if (status === 'WAITING_CLIENT') waitingClientMattersCount += 1;
      if (status === 'UNDER_REVIEW') underReviewMattersCount += 1;
      if (status === 'IN_PROGRESS') inProgressMattersCount += 1;

      const plannedValue = profile?.plannedValue || 0;
      const earnedValue = profile?.earnedValue || 0;
      const actualCost = profile?.actualCost || 0;
      const budget = profile?.budgetAtCompletion || 0;
      const spi = ratio(earnedValue, plannedValue);
      const cpi = ratio(earnedValue, actualCost);
      const progress = budget > 0
        ? Math.min(100, Math.round((earnedValue / budget) * 100))
        : matter.tasks.length > 0
          ? Math.round((matter.tasks.filter((task) => task.isDone).length / matter.tasks.length) * 100)
          : COMPLETED_STATUSES.has(status)
            ? 100
            : 0;
      const health = projectHealth(spi, cpi, overdueTasks);

      const isStale = new Date(matter.updatedAt) < fourteenDaysAgo;
      if (isStale || overdueTasks > 0 || health !== 'ON_TRACK') {
        const reason = overdueTasks > 0
          ? `${overdueTasks} مهام متأخرة`
          : health === 'DELAYED'
            ? 'انحراف يحتاج إجراءً تصحيحياً'
            : health === 'WATCH'
              ? 'الأداء أقل من الخطة'
              : 'لم يُحدّث منذ أكثر من 14 يوماً';
        mattersNeedingAttention.push({
          id: matter.id,
          title: matter.title,
          caseNumber: matter.caseNumber,
          status: matter.status,
          lawyerName: matter.lawyer?.name || 'غير محدد',
          updatedAt: matter.updatedAt,
          reason,
        });
        alerts.push({
          id: `project-${matter.id}`,
          projectId: matter.id,
          projectTitle: matter.title,
          severity: health === 'DELAYED' || overdueTasks > 0 ? 'HIGH' : 'MEDIUM',
          message: reason,
          href: `/matters?matterId=${matter.id}`,
        });
      }

      const compliance = profile
        ? [
            ['offPlanStatus', 'بيع على الخارطة', profile.offPlanStatus],
            ['buildingPermitStatus', 'رخصة البناء', profile.buildingPermitStatus],
            ['buildingCodeStatus', 'كود البناء السعودي', profile.buildingCodeStatus],
            ['occupancyStatus', 'شهادة الإشغال', profile.occupancyStatus],
          ].map(([key, label, value]) => ({ key, label, value }))
        : [];

      compliance
        .filter((item) => ['IN_REVIEW', 'NOT_STARTED', 'REJECTED'].includes(item.value))
        .forEach((item) => {
          alerts.push({
            id: `${matter.id}-${item.key}`,
            projectId: matter.id,
            projectTitle: matter.title,
            severity: item.value === 'REJECTED' ? 'HIGH' : 'MEDIUM',
            message: `${item.label}: ${item.value === 'IN_REVIEW' ? 'قيد المراجعة' : item.value === 'REJECTED' ? 'يتطلب معالجة' : 'لم يبدأ'}`,
            href: `/compliance?projectId=${matter.id}`,
          });
        });

      return {
        id: matter.id,
        title: matter.title,
        projectCode: profile?.projectCode || matter.caseNumber,
        city: profile?.city || 'غير محدد',
        stage: profile?.stage || status,
        status,
        health,
        responsibleName: matter.lawyer?.name || 'غير محدد',
        updatedAt: matter.updatedAt,
        plannedEnd: profile?.plannedEnd || matter.dueDate,
        projectValue: profile?.projectValue || 0,
        budgetAtCompletion: budget,
        plannedValue,
        earnedValue,
        actualCost,
        progress,
        spi,
        cpi,
        totalUnits: profile?.totalUnits || 0,
        soldUnits: profile?.soldUnits || 0,
        collectedAmount: profile?.collectedAmount || 0,
        compliance,
      };
    });

    const totals = projects.reduce(
      (acc, project) => {
        acc.projectValue += project.projectValue;
        acc.budget += project.budgetAtCompletion;
        acc.plannedValue += project.plannedValue;
        acc.earnedValue += project.earnedValue;
        acc.actualCost += project.actualCost;
        acc.totalUnits += project.totalUnits;
        acc.soldUnits += project.soldUnits;
        acc.collectedAmount += project.collectedAmount;
        return acc;
      },
      {
        projectValue: 0,
        budget: 0,
        plannedValue: 0,
        earnedValue: 0,
        actualCost: 0,
        totalUnits: 0,
        soldUnits: 0,
        collectedAmount: 0,
      },
    );

    const lawyersMap = new Map<
      string,
      { id: string; name: string; openMatters: number; completedMatters: number; completedTasks: number }
    >();
    activeUsers.forEach((user) => {
      lawyersMap.set(user.id, {
        id: user.id,
        name: user.name,
        openMatters: 0,
        completedMatters: 0,
        completedTasks: 0,
      });
    });
    allMatters.forEach((matter) => {
      if (matter.lawyerId && lawyersMap.has(matter.lawyerId)) {
        const owner = lawyersMap.get(matter.lawyerId)!;
        if (COMPLETED_STATUSES.has((matter.status || '').toUpperCase())) owner.completedMatters += 1;
        else owner.openMatters += 1;
      }
      matter.tasks.forEach((task) => {
        if (task.isDone && task.userId && lawyersMap.has(task.userId)) {
          lawyersMap.get(task.userId)!.completedTasks += 1;
        }
      });
    });

    return NextResponse.json({
      companyName: tenant?.name || 'شركة التطوير',
      executive: {
        projectValue: totals.projectValue,
        overallProgress: totals.budget > 0 ? Math.round((totals.earnedValue / totals.budget) * 100) : 0,
        spi: ratio(totals.earnedValue, totals.plannedValue),
        cpi: ratio(totals.earnedValue, totals.actualCost),
        salesRate: ratio(totals.soldUnits, totals.totalUnits),
        collectionRate: ratio(totals.collectedAmount, totals.projectValue),
        totalUnits: totals.totalUnits,
        soldUnits: totals.soldUnits,
        collectedAmount: totals.collectedAmount,
      },
      summary: {
        openMattersCount,
        completedMattersCount,
        archivedMattersCount,
        waitingClientMattersCount,
        underReviewMattersCount,
        inProgressMattersCount,
        overdueTasksCount,
        upcomingHearingsCount: upcomingMilestones.length,
        totalClientsCount,
        activeUsersCount: activeUsers.length,
      },
      projects,
      alerts: alerts
        .sort((a, b) => (a.severity === 'HIGH' && b.severity !== 'HIGH' ? -1 : 0))
        .slice(0, 8),
      mattersNeedingAttention: mattersNeedingAttention.slice(0, 10),
      upcomingAppointments: upcomingMilestones,
      lawyersProductivity: Array.from(lawyersMap.values()).filter(
        (owner) => owner.openMatters > 0 || owner.completedMatters > 0 || owner.completedTasks > 0,
      ),
    });
  } catch (error) {
    console.error('Error computing development dashboard metrics:', error);
    return NextResponse.json(
      { error: 'تعذر تحميل مؤشرات محفظة التطوير العقاري.' },
      { status: 500 },
    );
  }
}
