'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Copy, Link2, Loader2, Plus, ShieldCheck, X } from 'lucide-react';

type Matter = { id: string; title: string; client?: { name: string } | null; externalPartyName?: string | null };
type Share = { id: string; email: string; expiresAt: string; revokedAt: string | null; accessUrl?: string; matter: { id: string; title: string; status: string }; client?: { name: string } | null };

export default function ClientPortalManagementPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [matterId, setMatterId] = useState('');
  const [email, setEmail] = useState('');
  const [accessUrl, setAccessUrl] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [mattersResponse, sharesResponse] = await Promise.all([fetch('/api/lawyer/matters'), fetch('/api/lawyer/portal')]);
      const mattersBody = await mattersResponse.json();
      const sharesBody = await sharesResponse.json();
      if (!mattersResponse.ok || !sharesResponse.ok) throw new Error(mattersBody.error || sharesBody.error || 'تعذر تحميل المشاركات');
      setMatters(mattersBody);
      setShares(sharesBody);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل المشاركات'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadData(); }, []);

  async function createShare(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      const response = await fetch('/api/lawyer/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matterId, email, expiresInDays: 7 }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'تعذر إنشاء الرابط');
      setAccessUrl(body.accessUrl); setShowForm(false); setMatterId(''); setEmail(''); await loadData();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'تعذر إنشاء الرابط'); }
    finally { setSaving(false); }
  }

  async function revokeShare(id: string) {
    const response = await fetch('/api/lawyer/portal', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (response.ok) await loadData(); else setError((await response.json()).error || 'تعذر إلغاء الرابط');
  }

  return <div className="space-y-6 font-cairo"><header className="glass-card rounded-3xl border border-amber-500/20 p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-amber-400" /><div><h1 className="text-2xl font-extrabold text-slate-100">بوابة العملاء</h1><p className="mt-2 text-sm leading-7 text-slate-400">أنشئ رابط مشاركة منتهي الصلاحية ومربوطًا بمشروع محددة. لا يتم كشف رابط التخزين الأصلي للمستندات، ويمكن إلغاء الرابط في أي وقت.</p></div></div><button onClick={() => setShowForm(true)} className="gold-gradient-bg flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-950"><Plus className="h-4 w-4" />رابط مشاركة جديد</button></div></header>{error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"><AlertTriangle className="mb-2 h-5 w-5 text-rose-400" />{error}</div>}{accessUrl && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-emerald-300">تم إنشاء الرابط. انسخه وأرسله عبر قناة موثوقة.</p><p className="mt-2 break-all text-xs text-slate-300">{accessUrl}</p></div><button onClick={() => void navigator.clipboard.writeText(accessUrl)} className="rounded-lg border border-emerald-500/30 p-2 text-emerald-300"><Copy className="h-4 w-4" /></button></div></div>}{loading ? <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-400" /></div> : <section className="glass-card rounded-3xl p-6"><h2 className="text-base font-bold text-slate-100">روابط المشاركة</h2>{shares.length === 0 ? <p className="mt-5 text-sm text-slate-400">لا توجد روابط مشاركة حتى الآن.</p> : <div className="mt-4 space-y-3">{shares.map((share) => <div key={share.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:flex-row md:items-center"><div><p className="font-bold text-slate-100">{share.matter.title}</p><p className="mt-1 text-xs text-slate-400">{share.email} · ينتهي {new Date(share.expiresAt).toLocaleDateString('ar-SA')}</p></div>{share.revokedAt ? <span className="text-xs text-rose-400">ملغى</span> : <button onClick={() => void revokeShare(share.id)} className="flex items-center gap-1 self-start rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs text-rose-300"><X className="h-3.5 w-3.5" />إلغاء الرابط</button>}</div>)}</div>}</section>}{showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"><form onSubmit={createShare} className="glass-card w-full max-w-lg space-y-5 rounded-3xl border border-amber-500/30 p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-100">إنشاء رابط مشاركة</h2><button type="button" onClick={() => setShowForm(false)} className="text-slate-400"><X className="h-5 w-5" /></button></div><label className="block text-xs font-bold text-slate-300">المشروع<select required value={matterId} onChange={(event) => setMatterId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-xs text-slate-100"><option value="">اختر المشروع</option>{matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.title}</option>)}</select></label><label className="block text-xs font-bold text-slate-300">بريد العميل<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="client@example.com" className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-100" /></label><button disabled={saving} className="gold-gradient-bg flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold text-slate-950 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}إنشاء رابط لمدة 7 أيام</button></form></div>}</div>;
}
