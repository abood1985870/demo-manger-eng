'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Briefcase, Users, FileText, CheckSquare, Calendar, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function GlobalSearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lawyer/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      }
    } catch (e) {
      console.error('Error during global search', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="space-y-6 font-cairo text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Search className="w-6 h-6 text-amber-400" />
            <span>البحث الشامل في النظام (Global Search)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">البحث السريع في المشاريع، العملاء، المستندات، والمهام</p>
        </div>

        <div className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>محصور ببيانات شركتك فقط</span>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="glass-card p-4 rounded-2xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب اسم المشروع، رقم الملف، اسم العميل، المستند..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-12 pl-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-500/50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="gold-gradient-bg text-slate-950 font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 hover:brightness-110 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>بحث</span>
        </button>
      </form>

      {/* Results View */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">جاري البحث في قاعدة البيانات...</p>
        </div>
      ) : !results ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300">أدخل نص البحث لبدء الاستعلام الشامل</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section: Matters */}
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>المشاريع والمعاملات ({results.matters?.length || 0})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {results.matters?.length === 0 ? (
                <p className="text-xs text-slate-500 col-span-2">لا توجد مشاريع مطابقة.</p>
              ) : (
                results.matters.map((m: any) => (
                  <Link
                    key={m.id}
                    href={`/matters?matterId=${m.id}`}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/30 transition flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition">{m.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">رقم الملف: {m.caseNumber || m.id.substring(0, 8)} | العميل: {m.client?.name || 'غير محدد'}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Section: Clients */}
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
              <Users className="w-4 h-4 text-teal-400" />
              <span>حسابات العملاء ({results.clients?.length || 0})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {results.clients?.length === 0 ? (
                <p className="text-xs text-slate-500 col-span-2">لا يوجد عملاء مطابقون.</p>
              ) : (
                results.clients.map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/clients?clientId=${c.id}`}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-teal-500/30 transition flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition">{c.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.email || c.phone || 'عميل مسجل'}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Section: Documents */}
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>المستندات والوثائق ({results.documents?.length || 0})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {results.documents?.length === 0 ? (
                <p className="text-xs text-slate-500 col-span-2">لا توجد مستندات مطابقة.</p>
              ) : (
                results.documents.map((d: any) => (
                  <Link
                    key={d.id}
                    href={`/matters?matterId=${d.matterId}`}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-sky-500/30 transition flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-sky-400 transition">{d.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">المشروع: {d.matter?.title}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Section: Tasks & Hearings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>المهام ({results.tasks?.length || 0})</span>
              </h3>
              <div className="space-y-2 mt-3">
                {results.tasks?.length === 0 ? (
                  <p className="text-xs text-slate-500">لا توجد مهام مطابقة.</p>
                ) : (
                  results.tasks.map((t: any) => (
                    <Link
                      key={t.id}
                      href={`/matters?matterId=${t.matterId}`}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 block hover:border-amber-500/30 transition"
                    >
                      <p className="text-xs font-bold text-slate-200">{t.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">المشروع: {t.matter?.title}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>المواعيد والمراحل ({results.hearings?.length || 0})</span>
              </h3>
              <div className="space-y-2 mt-3">
                {results.hearings?.length === 0 ? (
                  <p className="text-xs text-slate-500">لا توجد مواعيد مطابقة.</p>
                ) : (
                  results.hearings.map((h: any) => (
                    <Link
                      key={h.id}
                      href={`/matters?matterId=${h.matterId}`}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 block hover:border-purple-500/30 transition"
                    >
                      <p className="text-xs font-bold text-slate-200">{h.title || h.court}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">📅 {new Date(h.date).toLocaleString('ar-SA')}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
