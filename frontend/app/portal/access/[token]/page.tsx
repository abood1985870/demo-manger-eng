'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Download, Loader2, ShieldCheck } from 'lucide-react';

type PortalData = { share: { email: string; expiresAt: string }; matter: { title: string; caseNumber: string | null; status: string; client?: { name: string } | null; externalPartyName: string | null; notes: string | null; documents: Array<{ id: string; title: string; type: string; createdAt: string; downloadUrl: string }> } };

export default function PortalAccessPage({ params }: { params: Promise<{ token: string }> }) {
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then(({ token }) => fetch(`/api/portal/access/${token}`)).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'الرابط غير صالح');
      setData(body);
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'تعذر فتح المشاركة'));
  }, [params]);

  if (!data && !error) return <div className="flex min-h-screen items-center justify-center bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-amber-400" /></div>;
  if (error) return <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6"><div className="max-w-md rounded-3xl border border-rose-500/30 bg-slate-900 p-8 text-center text-rose-200"><AlertTriangle className="mx-auto mb-4 h-8 w-8 text-rose-400" /><h1 className="text-xl font-bold">تعذر فتح الرابط</h1><p className="mt-2 text-sm">{error}</p></div></div>;
  if (!data) return null;

  return <main dir="rtl" className="min-h-screen bg-slate-950 p-6 font-cairo text-slate-100"><div className="mx-auto max-w-3xl space-y-6"><header className="rounded-3xl border border-amber-500/20 bg-slate-900 p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 h-6 w-6 text-amber-400" /><div><p className="text-xs font-bold text-amber-400">مشاركة آمنة من رُسوخ</p><h1 className="mt-1 text-2xl font-black">{data.matter.title}</h1><p className="text-xs text-slate-400">هذا الرابط مخصص للبريد {data.share.email} وينتهي في {new Date(data.share.expiresAt).toLocaleString('ar-SA')}</p></div></div></header><section className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-slate-500">رمز المشروع</p><p className="mt-1 font-bold">{data.matter.caseNumber || 'غير محدد'}</p></div><div><p className="text-xs text-slate-500">العميل أو الجهة</p><p className="mt-1 font-bold">{data.matter.client?.name || data.matter.externalPartyName || 'غير محدد'}</p></div><div><p className="text-xs text-slate-500">الحالة</p><p className="mt-1 font-bold">{data.matter.status}</p></div></div>{data.matter.notes && <div className="mt-6 border-t border-slate-800 pt-4"><p className="text-xs text-slate-500">ملاحظات المشاركة</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-300">{data.matter.notes}</p></div>}</section><section className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-lg font-bold">المستندات المشتركة</h2>{data.matter.documents.length === 0 ? <p className="mt-4 text-sm text-slate-400">لا توجد مستندات مشتركة.</p> : <div className="mt-4 divide-y divide-slate-800">{data.matter.documents.map((document) => <a key={document.id} href={document.downloadUrl} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-amber-400"><span className="truncate">{document.title}</span><Download className="h-4 w-4 shrink-0" /></a>)}</div>}</section></div></main>;
}
