'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Coins,
  FileCheck2,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

type ComplianceItem = {
  key: string;
  label: string;
  value: string;
};

type Project = {
  id: string;
  title: string;
  projectCode?: string | null;
  city: string;
  stage: string;
  health: 'ON_TRACK' | 'WATCH' | 'DELAYED';
  responsibleName: string;
  updatedAt: string;
  plannedEnd?: string | null;
  projectValue: number;
  budgetAtCompletion: number;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  progress: number;
  spi: number | null;
  cpi: number | null;
  totalUnits: number;
  soldUnits: number;
  collectedAmount: number;
  compliance: ComplianceItem[];
};

type DashboardData = {
  companyName: string;
  executive: {
    projectValue: number;
    overallProgress: number;
    spi: number | null;
    cpi: number | null;
    salesRate: number | null;
    collectionRate: number | null;
    totalUnits: number;
    soldUnits: number;
    collectedAmount: number;
  };
  projects: Project[];
  alerts: Array<{
    id: string;
    projectTitle: string;
    message: string;
    severity: 'HIGH' | 'MEDIUM';
    href: string;
  }>;
};

const STAGE_LABELS: Record<string, string> = {
  PLANNING: 'التخطيط',
  DESIGN: 'التصميم',
  FOUNDATION: 'أعمال الأساسات',
  STRUCTURE: 'الهيكل الإنشائي',
  MEP: 'الأعمال الكهروميكانيكية',
  FINISHING: 'التشطيبات',
  HANDOVER: 'التسليم',
  IN_PROGRESS: 'قيد التنفيذ',
  UNDER_REVIEW: 'قيد المراجعة',
  ON_HOLD: 'متوقف مؤقتاً',
};

const HEALTH_LABELS = {
  ON_TRACK: 'على المسار',
  WATCH: 'تحتاج متابعة',
  DELAYED: 'متأخر',
} as const;

const COMPLIANCE_LABELS: Record<string, string> = {
  APPROVED: 'معتمد',
  COMPLIANT: 'متوافق',
  IN_REVIEW: 'قيد المراجعة',
  NOT_STARTED: 'لم يبدأ',
  NOT_APPLICABLE: 'غير منطبق',
  REJECTED: 'يتطلب معالجة',
};

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000_000) {
    return `${new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(value / 1_000_000_000)} مليار`;
  }
  if (value >= 1_000_000) {
    return `${new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 1 }).format(value / 1_000_000)} مليون`;
  }
  return new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return 'غير محدد';
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function Metric({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'copper',
  progress,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Coins;
  tone?: 'copper' | 'green' | 'ink' | 'rose';
  progress?: number;
}) {
  return (
    <article className="rusukh-metric">
      <div className={`rusukh-icon rusukh-icon--${tone}`}>
        <Icon aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="rusukh-label">{label}</p>
        <div className="mt-3 flex items-end gap-2">
          <strong className="rusukh-metric-value">{value}</strong>
          {typeof progress === 'number' ? (
            <span
              className="rusukh-progress-ring"
              style={{ '--progress': `${Math.max(0, Math.min(100, progress)) * 3.6}deg` } as React.CSSProperties}
              aria-label={`نسبة ${progress}%`}
            />
          ) : null}
        </div>
        <p className="mt-2 text-[11px] text-[var(--rusukh-muted)]">{helper}</p>
      </div>
    </article>
  );
}

function ProgressComparison({ projects }: { projects: Project[] }) {
  const rows = projects.slice(0, 4);
  if (rows.length === 0) {
    return <p className="rusukh-empty">أضف بيانات المشروع لعرض مقارنة التقدم.</p>;
  }
  return (
    <div className="space-y-5">
      {rows.map((project) => {
        const planned = project.budgetAtCompletion > 0
          ? Math.min(100, Math.round((project.plannedValue / project.budgetAtCompletion) * 100))
          : 0;
        return (
          <div key={project.id}>
            <div className="mb-2 flex items-center justify-between gap-4 text-xs">
              <span className="font-bold text-[var(--rusukh-ink)]">{project.title}</span>
              <span className="tabular-nums text-[var(--rusukh-muted)]">
                {project.progress}% / {planned}%
              </span>
            </div>
            <div className="relative h-3 rounded-sm bg-[#E8E5DD]">
              <div
                className="absolute inset-y-0 right-0 rounded-sm bg-[var(--rusukh-green)]"
                style={{ width: `${project.progress}%` }}
              />
              <span
                className="absolute -top-1 h-5 w-px bg-[var(--rusukh-copper)]"
                style={{ right: `${planned}%` }}
                title={`المخطط ${planned}%`}
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-5 border-t border-[var(--rusukh-line)] pt-4 text-[10px] text-[var(--rusukh-muted)]">
        <span className="flex items-center gap-2"><i className="h-2 w-5 bg-[var(--rusukh-green)]" /> الفعلي</span>
        <span className="flex items-center gap-2"><i className="h-4 w-px bg-[var(--rusukh-copper)]" /> المخطط</span>
      </div>
    </div>
  );
}

export default function DevelopmentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/lawyer/dashboard', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'تعذر تحميل لوحة التحكم');
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const complianceSummary = useMemo(() => {
    const items = data?.projects.flatMap((project) =>
      project.compliance.map((item) => ({ ...item, projectTitle: project.title })),
    ) || [];
    return {
      approved: items.filter((item) => ['APPROVED', 'COMPLIANT'].includes(item.value)).length,
      review: items.filter((item) => item.value === 'IN_REVIEW').length,
      action: items.filter((item) => ['NOT_STARTED', 'REJECTED'].includes(item.value)).length,
      items: items.slice(0, 4),
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="rusukh-loading" role="status">
        <Loader2 className="h-7 w-7 animate-spin" />
        <span>نجهّز مؤشرات محفظة المشاريع…</span>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="rusukh-error" role="alert">
        <AlertTriangle className="h-6 w-6" />
        <div>
          <h1 className="font-bold">تعذر فتح النظرة التنفيذية</h1>
          <p>{error || 'لم تصل بيانات من النظام.'}</p>
        </div>
        <button type="button" onClick={() => void loadDashboard()}>
          <RefreshCw className="h-4 w-4" /> إعادة المحاولة
        </button>
      </div>
    );
  }

  const executive = data.executive;
  const leadingCompliance = complianceSummary.items;

  return (
    <div className="rusukh-dashboard" dir="rtl">
      <section className="rusukh-page-heading">
        <div>
          <h1>صباح الخير، فريق الأفق</h1>
          <p>أداء مشاريعك اليوم — من الأرض إلى التسليم</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="rusukh-period">
            هذا الربع <CalendarDays className="h-4 w-4" />
          </button>
          <Link href="/matters" className="rusukh-primary-button">
            <Plus className="h-5 w-5" /> إضافة مشروع
          </Link>
        </div>
      </section>

      <section className="rusukh-metrics" aria-label="المؤشرات التنفيذية">
        <Metric
          label="إجمالي قيمة المشاريع"
          value={formatCompactCurrency(executive.projectValue)}
          helper="ريال سعودي ضمن المحفظة الحالية"
          icon={Building2}
        />
        <Metric
          label="نسبة الإنجاز"
          value={`${executive.overallProgress}%`}
          helper="من ميزانية الأعمال المعتمدة"
          icon={TrendingUp}
          tone="green"
          progress={executive.overallProgress}
        />
        <Metric
          label="كفاءة الجدول SPI"
          value={executive.spi?.toFixed(2) || '—'}
          helper={executive.spi === null ? 'تحتاج قيمة مخططة ومكتسبة' : executive.spi >= 1 ? 'عند أو أعلى من الخطة' : 'أقل من 1 — يحتاج متابعة'}
          icon={Clock3}
          tone={executive.spi !== null && executive.spi < 0.9 ? 'rose' : 'ink'}
        />
        <Metric
          label="كفاءة التكلفة CPI"
          value={executive.cpi?.toFixed(2) || '—'}
          helper={executive.cpi === null ? 'تحتاج تكلفة فعلية وقيمة مكتسبة' : executive.cpi >= 1 ? 'ضمن الكفاءة المستهدفة' : 'أقل من 1 — يوجد انحراف'}
          icon={Coins}
          tone={executive.cpi !== null && executive.cpi < 0.9 ? 'rose' : 'copper'}
        />
      </section>

      <section className="rusukh-panel rusukh-portfolio">
        <div className="rusukh-panel-heading">
          <div>
            <h2>محفظة المشاريع</h2>
            <p>{data.projects.length} مشاريع مرتبطة ببيانات أداء فعلية</p>
          </div>
          <Link href="/matters">عرض جميع المشاريع <ArrowLeft className="h-4 w-4" /></Link>
        </div>
        {data.projects.length === 0 ? (
          <div className="rusukh-empty">لا توجد مشاريع بعد. ابدأ بإضافة مشروع جديد.</div>
        ) : (
          <div className="rusukh-project-table">
            <div className="rusukh-project-head" aria-hidden="true">
              <span>المشروع</span><span>مرحلة المشروع</span><span>نسبة الإنجاز</span>
              <span>الحالة</span><span>الميزانية</span><span>تاريخ التسليم</span>
            </div>
            {data.projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/matters?matterId=${project.id}`}
                className={`rusukh-project-row rusukh-project-row--${project.health.toLowerCase()}`}
              >
                <span className="rusukh-project-name">
                  <i><Building2 /></i>
                  <span><b>{project.title}</b><small>{project.city} · {project.projectCode || 'دون رمز'}</small></span>
                </span>
                <span>{STAGE_LABELS[project.stage] || project.stage}</span>
                <span className="rusukh-project-progress">
                  <b>{project.progress}%</b>
                  <i><em style={{ width: `${project.progress}%` }} /></i>
                </span>
                <span className={`rusukh-health rusukh-health--${project.health.toLowerCase()}`}>
                  <i /> {HEALTH_LABELS[project.health]}
                </span>
                <span>{formatCompactCurrency(project.budgetAtCompletion)}</span>
                <span>{formatDate(project.plannedEnd)}</span>
                <ArrowLeft className="rusukh-row-arrow" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rusukh-analytics-grid">
        <article className="rusukh-panel rusukh-analysis-panel">
          <div className="rusukh-panel-heading">
            <div><h2>التراخيص والامتثال</h2><p>حالة المتطلبات النظامية عبر المشاريع</p></div>
            <ShieldCheck className="h-5 w-5 text-[var(--rusukh-green)]" />
          </div>
          <div className="rusukh-compliance-summary">
            <div><CheckCircle2 /><strong>{complianceSummary.approved}</strong><span>مكتمل</span></div>
            <div><Clock3 /><strong>{complianceSummary.review}</strong><span>قيد المعالجة</span></div>
            <div><AlertTriangle /><strong>{complianceSummary.action}</strong><span>تحتاج إجراء</span></div>
          </div>
          <div className="rusukh-list">
            {leadingCompliance.map((item) => (
              <div key={`${item.projectTitle}-${item.key}`}>
                <FileCheck2 />
                <span><b>{item.label}</b><small>{item.projectTitle}</small></span>
                <em className={`rusukh-compliance-state rusukh-compliance-state--${item.value.toLowerCase()}`}>
                  {COMPLIANCE_LABELS[item.value] || item.value}
                </em>
              </div>
            ))}
          </div>
          <Link className="rusukh-panel-link" href="/compliance">عرض جميع المتطلبات <ArrowLeft /></Link>
        </article>

        <article className="rusukh-panel rusukh-analysis-panel">
          <div className="rusukh-panel-heading">
            <div><h2>التقدم مقابل الخطة</h2><p>المؤشر الأخضر فعلي والنحاسي مخطط</p></div>
            <TrendingUp className="h-5 w-5 text-[var(--rusukh-green)]" />
          </div>
          <ProgressComparison projects={data.projects} />
          <Link className="rusukh-panel-link" href="/matters">عرض تفاصيل الأداء <ArrowLeft /></Link>
        </article>

        <div className="space-y-5">
          <article className="rusukh-panel rusukh-cash-panel">
            <div className="rusukh-panel-heading">
              <div><h2>المبيعات والتحصيل</h2><p>ملخص الوحدات والتدفق الداخل</p></div>
              <CircleDollarSign className="h-5 w-5 text-[var(--rusukh-copper)]" />
            </div>
            <div className="rusukh-cash-stats">
              <div><span>الوحدات المباعة</span><b>{executive.soldUnits} / {executive.totalUnits}</b></div>
              <div><span>نسبة المبيعات</span><b>{Math.round((executive.salesRate || 0) * 100)}%</b></div>
              <div><span>إجمالي التحصيل</span><b>{formatCompactCurrency(executive.collectedAmount)}</b></div>
            </div>
            <div className="rusukh-wide-progress">
              <i style={{ width: `${Math.round((executive.salesRate || 0) * 100)}%` }} />
            </div>
          </article>

          <article className="rusukh-panel rusukh-alerts-panel">
            <div className="rusukh-panel-heading">
              <div><h2>تنبيهات تتطلب القرار</h2><p>الأعلى أثراً على الوقت والتكلفة</p></div>
              <AlertTriangle className="h-5 w-5 text-[#B84C45]" />
            </div>
            <div className="rusukh-alert-list">
              {data.alerts.length === 0 ? (
                <p className="rusukh-empty">لا توجد تنبيهات حرجة حالياً.</p>
              ) : data.alerts.slice(0, 3).map((alert) => (
                <Link key={alert.id} href={alert.href}>
                  <AlertTriangle />
                  <span><b>{alert.message}</b><small>{alert.projectTitle}</small></span>
                  <em>{alert.severity === 'HIGH' ? 'عالي' : 'متوسط'}</em>
                  <ArrowLeft />
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      <footer className="rusukh-data-note">
        <Banknote /> مؤشرات SPI وCPI محسوبة من القيم المخططة والمكتسبة والتكلفة الفعلية المسجلة في كل مشروع.
      </footer>
    </div>
  );
}
