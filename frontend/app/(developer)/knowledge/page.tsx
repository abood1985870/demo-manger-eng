'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Eye, FileText, Loader2, Plus, Search, ShieldCheck, X } from 'lucide-react';

type KnowledgeItem = { id: string; title: string; category: string; content: string; status?: string; fileName: string | null; fileUrl: string | null; createdBy?: { name: string; role: string } };
const emptyForm = { title: '', category: 'تقرير تطويرية', content: '' };

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<KnowledgeItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/legal/knowledge');
      if (!response.ok) throw new Error('تعذر تحميل قاعدة المعرفة');
      
      const data = await response.json();
      // Map backend fields to frontend fields
      const mappedData = data.map((item: any) => ({
        id: item.id,
        title: item.title_ar || item.title_en || 'بدون عنوان',
        category: item.knowledge_type,
        content: item.summary || 'بدون محتوى',
        status: item.status,
        fileName: null,
        fileUrl: null,
        createdBy: item.author
      }));
      setItems(mappedData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/legal/knowledge/${id}/approve`, { method: 'POST' });
      if (response.ok) {
        await loadData();
      } else {
        alert('لا تملك صلاحية لاعتماد المادة');
      }
    } catch (e) {
      alert('خطأ في الاتصال');
    }
  };

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.category.trim() || !form.content.trim()) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await fetch('/api/legal/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'تعذر حفظ المادة');
      }
      setShowCreate(false);
      setForm(emptyForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'تعذر حفظ المادة');
    } finally {
      setIsSaving(false);
    }
  }

  const visibleItems = items.filter((item) => `${item.title} ${item.category} ${item.content}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6 font-cairo">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5"><BookOpen className="w-6 h-6 text-amber-400" /> قاعدة المعرفة التطويرية</h1><p className="text-xs text-slate-400 mt-1">مذكرات ومبادئ محفوظة في قاعدة بيانات الشركة مع اسم الكاتب.</p></div><button onClick={() => setShowCreate(true)} className="gold-gradient-bg text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"><Plus className="w-4 h-4" /> إضافة مادة</button></div>
      {error && <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}
      <div className="glass-card p-4 rounded-2xl flex items-center gap-3"><Search className="w-4 h-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في المواد التطويرية..." className="flex-1 bg-transparent outline-none text-sm text-slate-100" /></div>
      <div className="glass-card p-6 rounded-3xl"><div className="flex items-center justify-between mb-5"><h2 className="font-bold text-base text-slate-100 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-400" /> المواد المنشورة والمسودات</h2><span className="text-xs text-slate-400">{visibleItems.length} مادة</span></div>{isLoading ? <div className="flex h-48 items-center justify-center"><Loader2 className="w-7 h-7 text-amber-400 animate-spin" /></div> : visibleItems.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">لا توجد مواد مطابقة للبحث.</div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{visibleItems.map((item) => <article key={item.id} className={`p-5 rounded-2xl bg-slate-900 border ${item.status === 'PRIVATE_DRAFT' ? 'border-rose-500/50' : 'border-slate-800'} hover:border-amber-500/30`}><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] text-amber-400 font-bold">{item.category} {item.status === 'PRIVATE_DRAFT' && '(مسودة خاصة)'}</span><h3 className="font-bold text-slate-100 text-sm mt-1">{item.title}</h3></div><FileText className="w-5 h-5 text-slate-500" /></div><p className="text-xs text-slate-400 leading-6 mt-3 line-clamp-3">{item.content}</p><div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800"><span className="text-[10px] text-slate-500">بواسطة: {item.createdBy?.name || 'مستخدم الشركة'}</span><div className="flex items-center gap-2">{item.status === 'PRIVATE_DRAFT' && <button onClick={() => handleApprove(item.id)} className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg font-bold">اعتماد كعامة</button>} <button onClick={() => setSelected(item)} className="text-xs text-amber-400 font-bold flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> عرض</button></div></div></article>)}</div>}</div>

      {showCreate && <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="glass-card p-8 rounded-3xl w-full max-w-lg border-amber-500/30"><div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5"><h2 className="font-bold text-lg text-slate-100">إضافة مادة تطويرية</h2><button onClick={() => setShowCreate(false)} className="text-slate-400"><X className="w-5 h-5" /></button></div><form onSubmit={handleCreate} className="space-y-4"><input required placeholder="عنوان المادة" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100" /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100"><option>تقرير تطويرية</option><option>مبدأ ميداني</option><option>بحث نظامي</option><option>نموذج داخلي</option></select><textarea required rows={8} placeholder="المحتوى والمبادئ والأسانيد" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100" />
      <div><label className="block text-xs font-bold text-slate-300 mb-1.5">إرفاق ملف أو صورة (اختياري)</label><input type="file" onChange={(e) => { const file = e.target.files?.[0]; if(file) setForm({ ...form, fileName: file.name, fileUrl: '#' } as any) }} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20" /></div>
      <button disabled={isSaving} className="w-full gold-gradient-bg text-slate-950 font-extrabold py-2.5 rounded-xl text-xs disabled:opacity-50">{isSaving ? 'جار الحفظ...' : 'حفظ المادة'}</button></form></div></div>}

      {selected && <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="glass-card p-8 rounded-3xl w-full max-w-2xl border-amber-500/30 space-y-5"><div className="flex items-start justify-between border-b border-slate-800 pb-4"><div><span className="text-xs text-amber-400">{selected.category}</span><h2 className="font-extrabold text-lg text-slate-100 mt-2">{selected.title}</h2><p className="text-[10px] text-slate-500 mt-1">بواسطة: {selected.createdBy?.name || 'مستخدم الشركة'}</p></div><button onClick={() => setSelected(null)} className="text-slate-400"><X className="w-5 h-5" /></button></div><div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-300 leading-7 whitespace-pre-wrap">{selected.content}</div></div></div>}
    </div>
  );
}
