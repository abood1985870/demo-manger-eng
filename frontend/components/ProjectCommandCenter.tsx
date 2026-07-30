import {
  AlertTriangle,
  Banknote,
  Building2,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Gauge,
  ListChecks,
  MapPin,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import {
  COMPLIANCE_STATUS_LABELS,
  PROJECT_COMPLIANCE_FIELDS,
  PROJECT_LIFECYCLE,
  complianceTone,
  getProjectStageGroup,
  getProjectStageLabel,
} from '@/lib/project-domain';

type ProjectCommandCenterProps = {
  matter: any;
  tasks: any[];
  appointments: any[];
};

function percentage(value: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

function ratio(value: number, base: number) {
  if (!base || base <= 0) return null;
  return value / base;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function ProjectCommandCenter({ matter, tasks, appointments }: ProjectCommandCenterProps) {
  const profile = matter?.developmentProfile;
  const stageGroup = getProjectStageGroup(profile?.stage);
  const stageIndex = PROJECT_LIFECYCLE.findIndex((stage) => stage.id === stageGroup);
  const progress = percentage(profile?.earnedValue || 0, profile?.budgetAtCompletion || 0);
  const salesRate = percentage(profile?.soldUnits || 0, profile?.totalUnits || 0);
  const collectionRate = percentage(profile?.collectedAmount || 0, profile?.projectValue || 0);
  const spi = ratio(profile?.earnedValue || 0, profile?.plannedValue || 0);
  const cpi = ratio(profile?.earnedValue || 0, profile?.actualCost || 0);
  const openTasks = tasks.filter((task) => !task.isDone && task.status !== 'DONE' && task.status !== 'CANCELLED');
  const overdueTasks = openTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date());
  const complianceItems = PROJECT_COMPLIANCE_FIELDS.map((field) => ({
    ...field,
    value: profile?.[field.key] || (field.key === 'offPlanStatus' ? 'NOT_APPLICABLE' : 'NOT_STARTED'),
  }));
  const actionItems = complianceItems.filter((item) =>
    ['NOT_STARTED', 'IN_PROGRESS', 'IN_REVIEW', 'ACTION_REQUIRED', 'REJECTED', 'EXPIRED'].includes(item.value),
  );

  return (
    <div className="space-y-5 overflow-y-auto pr-1 subtle-scroll" data-testid="project-command-center">
      <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-l from-amber-500/10 via-slate-950/80 to-slate-950 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-amber-400">مركز المشروع</p>
            <h4 className="mt-2 text-lg font-black text-slate-100">{matter?.title}</h4>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{matter?.caseNumber || profile?.projectCode || 'بدون رمز'}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile?.city || 'الموقع غير محدد'}</span>
              <span className="flex items-center gap-1"><UsersRound className="h-3.5 w-3.5" />{matter?.lawyer?.name || 'مدير المشروع غير محدد'}</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
            <p className="text-[10px] text-slate-500">المرحلة الحالية</p>
            <p className="mt-1 text-sm font-extrabold text-amber-300">{getProjectStageLabel(profile?.stage)}</p>
          </div>
        </div>
      </section>

      <section aria-label="دورة حياة المشروع" className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
          {PROJECT_LIFECYCLE.map((stage, index) => {
            const isDone = index < stageIndex;
            const isCurrent = index === stageIndex;
            return (
              <div key={stage.id} className={`rounded-xl border px-2 py-3 text-center ${isCurrent ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' : isDone ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' : 'border-slate-800 bg-slate-900/60 text-slate-500'}`}>
                {isDone ? <CheckCircle2 className="mx-auto h-4 w-4" /> : isCurrent ? <Gauge className="mx-auto h-4 w-4" /> : <Circle className="mx-auto h-4 w-4" />}
                <p className="mt-2 text-[10px] font-bold leading-4">{stage.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ['الإنجاز المكتسب', `${progress}%`, `${formatMoney(profile?.earnedValue || 0)} من الميزانية`, Gauge, progress >= 80 ? 'text-emerald-300' : 'text-amber-300'],
          ['مؤشر الجدول SPI', spi === null ? '—' : spi.toFixed(2), '1.00 فأعلى ضمن الخطة', Clock3, spi !== null && spi < 0.9 ? 'text-rose-300' : 'text-emerald-300'],
          ['مؤشر التكلفة CPI', cpi === null ? '—' : cpi.toFixed(2), '1.00 فأعلى كفاءة جيدة', Banknote, cpi !== null && cpi < 0.9 ? 'text-rose-300' : 'text-emerald-300'],
          ['مبيعات الوحدات', `${salesRate}%`, `${profile?.soldUnits || 0} من ${profile?.totalUnits || 0} وحدة`, Building2, 'text-sky-300'],
          ['التحصيل', `${collectionRate}%`, formatMoney(profile?.collectedAmount || 0), Banknote, 'text-violet-300'],
        ].map(([label, value, hint, Icon, tone]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400">{String(label)}</p>
              <Icon className={`h-4 w-4 ${tone}`} />
            </div>
            <p className={`mt-3 text-xl font-black ${tone}`}>{String(value)}</p>
            <p className="mt-1 text-[9px] text-slate-500">{String(hint)}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
          <div className="flex items-center justify-between">
            <h5 className="flex items-center gap-2 text-sm font-extrabold text-slate-100"><ListChecks className="h-4 w-4 text-amber-400" />مسارات العمل المفتوحة</h5>
            {overdueTasks.length > 0 && <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[9px] font-bold text-rose-300">{overdueTasks.length} متأخرة</span>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ['المهام المفتوحة', openTasks.length, ListChecks],
              ['المواعيد والمراحل', appointments.length, Clock3],
              ['مستندات المشروع', matter?.documents?.length || 0, FileText],
              ['بوابات تحتاج متابعة', actionItems.length, ShieldCheck],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <Icon className="h-4 w-4 text-slate-500" />
                <p className="mt-2 text-lg font-black text-slate-100">{String(value)}</p>
                <p className="text-[10px] text-slate-500">{String(label)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
          <h5 className="flex items-center gap-2 text-sm font-extrabold text-slate-100"><ShieldCheck className="h-4 w-4 text-amber-400" />بوابات التراخيص والامتثال</h5>
          <div className="mt-4 space-y-2">
            {complianceItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5">
                <span className="text-[10px] font-bold text-slate-300">{item.shortLabel}</span>
                <span className={`rounded-full border px-2 py-1 text-[9px] font-bold ${complianceTone(item.value)}`}>{COMPLIANCE_STATUS_LABELS[item.value] || item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(overdueTasks.length > 0 || actionItems.some((item) => ['ACTION_REQUIRED', 'REJECTED', 'EXPIRED'].includes(item.value))) && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>يحتاج المشروع إلى تدخل إداري: راجع المهام المتأخرة وبوابات الامتثال ذات الحالة الحرجة قبل اعتماد المرحلة التالية.</p>
        </div>
      )}
    </div>
  );
}
