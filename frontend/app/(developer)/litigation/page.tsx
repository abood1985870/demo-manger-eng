'use client';

import { useEffect, useState } from 'react';
import { Building2, Calendar, CalendarPlus, CheckCircle, Clock, Eye, FileCheck, FileText, Loader2, MapPin, Milestone, Plus, X } from 'lucide-react';

type Matter = { id: string; title: string; caseNumber: string | null };
type Hearing = {
  id: string;
  matterId: string;
  date: string;
  court: string;
  summary: string | null;
  status: string;
  matter?: Matter;
};

const emptyForm = { matterId: '', court: '', date: '', summary: '' };

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function LitigationPage() {
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<Hearing | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setIsLoading(true);
    setError('');
    try {
      const [hearingsResponse, mattersResponse] = await Promise.all([
        fetch('/api/lawyer/hearings'),
        fetch('/api/lawyer/matters'),
      ]);
      if (!hearingsResponse.ok || !mattersResponse.ok) throw new Error('تعذر تحميل بيانات التنفيذ والمتابعة');
      setHearings(await hearingsResponse.json());
      const loadedMatters = await mattersResponse.json();
      setMatters(loadedMatters);
      setForm((current) => ({ ...current, matterId: current.matterId || loadedMatters[0]?.id || '' }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!form.matterId || !form.court.trim() || !form.date) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await fetch('/api/lawyer/hearings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matterId: form.matterId,
          court: form.court.trim(),
          date: new Date(form.date).toISOString(),
          summary: form.summary.trim() || null,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'تعذر حفظ الموعد');
      }
      setShowCreate(false);
      setForm((current) => ({ ...emptyForm, matterId: current.matterId }));
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'تعذر حفظ الموعد');
    } finally {
      setIsSaving(false);
    }
  }

  const upcoming = hearings.filter((hearing) => new Date(hearing.date).getTime() >= Date.now());

  return (
    <div className="space-y-6 font-cairo">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Milestone className="w-6 h-6 text-amber-400" />
            <span>الجدول الزمني والمراحل الرئيسية</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">متابعة المواعيد المرتبطة بالمشاريع التي تملك صلاحية الوصول إليها.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="gold-gradient-bg text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20">
          <Plus className="w-4 h-4" /> إضافة موعد أو مرحلة
        </button>
      </div>

      {error && <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold"><span>المواعيد القادمة</span><Calendar className="w-4 h-4 text-amber-400" /></div>
          <p className="text-2xl font-black text-slate-100 mt-2">{upcoming.length}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold"><span>إجمالي المواعيد</span><CalendarPlus className="w-4 h-4 text-blue-400" /></div>
          <p className="text-2xl font-black text-blue-400 mt-2">{hearings.length}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold"><span>المشاريع المرتبطة</span><FileCheck className="w-4 h-4 text-emerald-400" /></div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{matters.length}</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl">
        <h2 className="font-bold text-base text-slate-100 mb-4 flex items-center gap-2"><Milestone className="w-5 h-5 text-amber-400" /> جدول المواعيد والمراحل</h2>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center"><Loader2 className="w-7 h-7 text-amber-400 animate-spin" /></div>
        ) : hearings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">لا توجد مواعيد مسجلة بعد.</div>
        ) : (
          <div className="space-y-4">
            {hearings.map((hearing) => (
              <div key={hearing.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-amber-400 font-bold text-xs bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">{hearing.matter?.caseNumber || hearing.matterId.slice(0, 8)}</span>
                    <h3 className="font-bold text-slate-100 text-sm">{hearing.matter?.title || 'مشروع'}</h3>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-500" />{hearing.court}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(hearing.date)}</p>
                </div>
                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">{hearing.status}</span>
                  <button onClick={() => setSelected(hearing)} className="glass-card hover:bg-slate-800 text-xs font-bold text-slate-200 px-3.5 py-2 rounded-xl border-slate-700 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-amber-400" /> عرض التفاصيل</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-3xl w-full max-w-lg border-amber-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4"><h2 className="font-bold text-lg text-slate-100 flex items-center gap-2"><CalendarPlus className="w-5 h-5 text-amber-400" /> إضافة موعد أو مرحلة</h2><button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleCreate} className="space-y-4">
              <label className="block text-xs font-bold text-slate-300">المشروع
                <select required value={form.matterId} onChange={(event) => setForm({ ...form, matterId: event.target.value })} className="mt-1.5 w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100">
                  <option value="">اختر المشروع</option>{matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.caseNumber || matter.id.slice(0, 8)} - {matter.title}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold text-slate-300">الموقع أو الجهة<input required value={form.court} onChange={(event) => setForm({ ...form, court: event.target.value })} className="mt-1.5 w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100" placeholder="الموقع، المكتب الاستشاري، أو الجهة المختصة" /></label>
              <label className="block text-xs font-bold text-slate-300">التاريخ والوقت<input required type="datetime-local" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-1.5 w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100" /></label>
              <label className="block text-xs font-bold text-slate-300">الملاحظات<textarea rows={3} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} className="mt-1.5 w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100" /></label>
              <div className="pt-4 border-t border-slate-800 flex justify-end"><button disabled={isSaving} className="gold-gradient-bg text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs disabled:opacity-50">{isSaving ? 'جار الحفظ...' : 'حفظ الموعد'}</button></div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-3xl w-full max-w-xl border-amber-500/30 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4"><div><span className="font-mono text-amber-400 font-bold text-xs">{selected.matter?.caseNumber || selected.matterId.slice(0, 8)}</span><h2 className="font-extrabold text-lg text-slate-100 mt-2">{selected.matter?.title || 'تفاصيل الموعد'}</h2><p className="text-xs text-slate-400 mt-1">{selected.court}</p></div><button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-sm"><p className="text-emerald-400 flex items-center gap-2"><Clock className="w-4 h-4" />{formatDate(selected.date)}</p><p className="text-slate-400 flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" />{selected.court}</p><p className="text-slate-300 flex items-start gap-2"><FileText className="w-4 h-4 text-amber-400 mt-0.5" />{selected.summary || 'لا توجد ملاحظات مسجلة.'}</p></div>
            <div className="pt-4 border-t border-slate-800 flex justify-end"><button onClick={() => setSelected(null)} className="gold-gradient-bg text-slate-950 font-extrabold px-5 py-2 rounded-xl text-xs flex items-center gap-2"><CheckCircle className="w-4 h-4" /> إغلاق</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
