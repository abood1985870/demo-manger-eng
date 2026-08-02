'use client';

import { useState, useEffect } from 'react';
import { Search, Building2, LayoutGrid, AlertTriangle, FileText, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-cairo" dir="rtl">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-slate-800 bg-slate-900/50">
          <Search className="w-5 h-5 text-amber-500 shrink-0" />
          <input 
            type="text" 
            placeholder="ابحث عن مشروع، وحدة، عميل، أو صفحة (مثال: برج رسوخ)..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none py-4 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-lg"
            autoFocus
          />
          <span className="text-[10px] font-mono text-slate-500 border border-slate-700 rounded px-1.5 py-0.5 bg-slate-800 hidden sm:block">ESC</span>
        </div>

        {/* Search Results (Mocked for WOW factor) */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query && (
            <div className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
              الوصول السريع
            </div>
          )}
          
          <div className="space-y-1">
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 text-slate-300 transition-colors group">
              <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-amber-500/20"><Building2 className="w-4 h-4" /></div>
              <div className="flex-1">
                <p className="font-bold">اللوحة التنفيذية (Dashboard)</p>
                <p className="text-xs text-slate-500 mt-0.5">ملخص مالي وهندسي شامل</p>
              </div>
              <span className="text-xs text-slate-600 font-mono">صفحة</span>
            </Link>

            <Link href="/units" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 transition-colors group">
              <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-emerald-500/20"><LayoutGrid className="w-4 h-4" /></div>
              <div className="flex-1">
                <p className="font-bold">إدارة المخزون والوحدات</p>
                <p className="text-xs text-slate-500 mt-0.5">ابحث في أكثر من 300 وحدة عقارية</p>
              </div>
              <span className="text-xs text-slate-600 font-mono">صفحة</span>
            </Link>

            <Link href="/wafi" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 text-slate-300 transition-colors group">
              <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-blue-500/20"><AlertTriangle className="w-4 h-4" /></div>
              <div className="flex-1">
                <p className="font-bold">منصة وافي وحسابات الضمان</p>
                <p className="text-xs text-slate-500 mt-0.5">مراقبة السيولة وإصدار التقارير الهندسية</p>
              </div>
              <span className="text-xs text-slate-600 font-mono">صفحة</span>
            </Link>

            {query.includes('برج') || query.includes('رسوخ') && (
              <>
                <div className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800 mt-2 pt-4">
                  نتائج المشاريع
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer group">
                  <div className="bg-amber-500 p-2 rounded-lg text-slate-950"><Building2 className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <p className="font-bold text-white">برج رسوخ السكني الفاخر</p>
                    <p className="text-xs text-amber-400 mt-0.5">تحت الإنشاء — نسبة الإنجاز 30%</p>
                  </div>
                  <span className="text-xs text-slate-600 font-mono">مشروع عقاري</span>
                </div>
              </>
            )}

            {query.includes('راجحي') || query.includes('عبدالله') && (
              <>
                <div className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800 mt-2 pt-4">
                  العملاء
                </div>
                <Link href="/portal" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors group">
                  <div className="bg-slate-800 p-2 rounded-lg text-slate-400 group-hover:text-white"><UserCircle className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <p className="font-bold text-white">عبدالله الراجحي (مستثمر VIP)</p>
                    <p className="text-xs text-slate-500 mt-0.5">يملك 4 وحدات عقارية — فاتورة مستحقة قريباً</p>
                  </div>
                  <span className="text-xs text-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">عميل نشط</span>
                </Link>
              </>
            )}

          </div>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="border border-slate-700 bg-slate-800 rounded px-1 font-mono">↑↓</span> للتنقل</span>
            <span className="flex items-center gap-1"><span className="border border-slate-700 bg-slate-800 rounded px-1 font-mono">Enter</span> للاختيار</span>
          </div>
          <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Rusukh AI Search
          </div>
        </div>
      </div>
    </div>
  );
}
