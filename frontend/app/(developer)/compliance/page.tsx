'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CircleDashed,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  COMPLIANCE_STATUS_LABELS,
  COMPLIANCE_STATUS_OPTIONS,
  PROJECT_COMPLIANCE_FIELDS,
  ProjectComplianceField,
  complianceTone,
  getProjectStageLabel,
} from '@/lib/project-domain';

type Project = {
  id: string;
  title: string;
  caseNumber: string | null;
  lawyer: { name: string } | null;
  developmentProfile: Record<string, any> | null;
};

function valueFor(project: Project, field: ProjectComplianceField) {
  return project.developmentProfile?.[field] || (field === 'offPlanStatus' ? 'NOT_APPLICABLE' : 'NOT_STARTED');
}

export default function CompliancePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [savingField, setSavingField] = useState<ProjectComplianceField | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/lawyer/project-compliance');
      if (!response.ok) throw new Error('تعذر تحميل متطلبات المشاريع');
      const loaded: Project[] = await response.json();
      setProjects(loaded);
      const requestedProject = new URLSearchParams(window.location.search).get('projectId');
      setSelectedProjectId((current) =>
        (requestedProject && loaded.some((project) => project.id === requestedProject) ? requestedProject : current)
        || loaded[0]?.id
        || '',
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;
  const portfolioSummary = useMemo(() => {
    const values = projects.flatMap((project) =>
      PROJECT_COMPLIANCE_FIELDS.map((field) => valueFor(project, field.key)),
    );
    return {
      complete: values.filter((value) => ['APPROVED', 'COMPLIANT', 'ISSUED', 'NOT_APPLICABLE'].includes(value)).length,
      attention: values.filter((value) => ['ACTION_REQUIRED', 'REJECTED', 'EXPIRED'].includes(value)).length,
      pending: values.filter((value) => ['NOT_STARTED', 'IN_PROGRESS', 'IN_REVIEW'].includes(value)).length,
    };
  }, [projects]);

  async function updateRequirement(field: ProjectComplianceField, value: string) {
    if (!selectedProject) return;
    const previousProjects = projects;
    setSavingField(field);
    setError('');
    setProjects((current) => current.map((project) => project.id === selectedProject.id ? {
      ...project,
      developmentProfile: { ...(project.developmentProfile || {}), [field]: value },
    } : project));

    try {
      const response = await fetch('/api/lawyer/project-compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matterId: selectedProject.id, field, value }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'تعذر حفظ الحالة');
      }
    } catch (saveError) {
      setProjects(previousProjects);
      setError(saveError instanceof Error ? saveError.message : 'تعذر حفظ الحالة');
    } finally {
      setSavingField(null);
    }
  }

  return (
    <div className="space-y-6 font-cairo" data-testid="project-compliance-page">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-amber-400">حوكمة التطوير</p>
          <h1 className="mt-2 flex items-center gap-2.5 text-2xl font-extrabold text-slate-100">
            <ShieldCheck className="h-6 w-6 text-amber-400" />
            التراخيص والامتثال
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-400">
            بوابات المشروع النظامية من البيع على الخارطة حتى شهادة الإشغال. الحالات هنا أداة متابعة داخلية ولا تُغني عن التحقق من الجهة المختصة.
          </p>
        </div>
        <label className="text-xs font-bold text-slate-300">
          المشروع
          <select
            aria-label="اختيار المشروع"
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            className="mt-1.5 w-full min-w-72 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-500/50"
          >
            {projects.map((project) => <option key={project.id} value={project.id}>{project.caseNumber || project.id.slice(0, 8)} — {project.title}</option>)}
          </select>
        </label>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'بوابات مكتملة أو غير منطبقة', value: portfolioSummary.complete, icon: CheckCircle2, tone: 'text-emerald-300' },
          { label: 'قيد الاستكمال أو المراجعة', value: portfolioSummary.pending, icon: CircleDashed, tone: 'text-amber-300' },
          { label: 'تتطلب تدخلاً فورياً', value: portfolioSummary.attention, icon: AlertTriangle, tone: 'text-rose-300' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400">{label}</p>
              <Icon className={`h-5 w-5 ${tone}`} />
            </div>
            <p className={`mt-3 text-2xl font-black ${tone}`}>{value}</p>
          </div>
        ))}
      </section>

      {isLoading ? (
        <div className="flex h-72 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-400" /></div>
      ) : !selectedProject ? (
        <div className="glass-card rounded-3xl border border-dashed border-slate-700 p-12 text-center">
          <Building2 className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm text-slate-400">لا توجد مشاريع نشطة يمكن متابعتها.</p>
        </div>
      ) : (
        <>
          <section className="glass-card rounded-3xl border border-amber-500/20 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold text-amber-400">{selectedProject.caseNumber || selectedProject.id.slice(0, 8)}</p>
                <h2 className="mt-2 text-xl font-black text-slate-100">{selectedProject.title}</h2>
                <p className="mt-2 text-xs text-slate-400">
                  مدير المشروع: {selectedProject.lawyer?.name || 'غير محدد'} · المرحلة: {getProjectStageLabel(selectedProject.developmentProfile?.stage)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs text-slate-400">
                آخر تحديث: {selectedProject.developmentProfile?.updatedAt ? new Date(selectedProject.developmentProfile.updatedAt).toLocaleDateString('ar-SA') : 'لم يُسجل'}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            {PROJECT_COMPLIANCE_FIELDS.map((field) => {
              const currentValue = valueFor(selectedProject, field.key);
              return (
                <article key={field.key} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-100">{field.label}</h3>
                      <p className="mt-2 text-[11px] leading-5 text-slate-500">{field.description}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold ${complianceTone(currentValue)}`}>
                      {COMPLIANCE_STATUS_LABELS[currentValue] || currentValue}
                    </span>
                  </div>
                  <label className="mt-5 block text-[10px] font-bold text-slate-400">
                    تحديث حالة البوابة
                    <div className="relative mt-1.5">
                      <select
                        aria-label={`حالة ${field.label}`}
                        value={currentValue}
                        disabled={savingField === field.key}
                        onChange={(event) => void updateRequirement(field.key, event.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-500/50 disabled:opacity-60"
                      >
                        {COMPLIANCE_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      {savingField === field.key && <Loader2 className="absolute left-3 top-2.5 h-4 w-4 animate-spin text-amber-400" />}
                    </div>
                  </label>
                </article>
              );
            })}
          </section>

          <aside className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-[11px] leading-6 text-sky-200">
            الترتيب المقترح للإقفال: التحقق من انطباق البيع على الخارطة، اعتماد التصميم ورخصة البناء، متابعة مطابقة كود البناء والتأمين، ثم شهادة الإشغال قبل التسليم والتشغيل.
          </aside>
        </>
      )}
    </div>
  );
}
