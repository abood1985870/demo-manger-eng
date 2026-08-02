'use client';

import { useState } from 'react';
import { Presentation, Link as LinkIcon, ExternalLink, Sparkles, Copy, CheckCircle2, Crown, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

export default function PitchDeckManager({ properties }: { properties: any[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    const url = `${window.location.origin}/vip-pitch/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <header className="rusukh-page-header border-b border-slate-800 pb-8 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10 px-8 pt-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-500" />
            عروض المستثمرين الكبار (VIP Pitch Decks)
          </h1>
          <p className="text-slate-400 text-sm">قم بتوليد صفحات هبوط تفاعلية وسينمائية لعملائك الكبار لزيادة نسب الإغلاق.</p>
        </div>
      </header>

      <section className="p-8">
        
        {/* Intro Card */}
        <div className="bg-gradient-to-r from-amber-600/10 to-amber-900/10 border border-amber-500/20 rounded-3xl p-8 mb-10 flex flex-col md:flex-row items-center gap-8 shadow-[0_0_50px_rgba(245,158,11,0.05)]">
          <div className="w-32 h-32 bg-slate-950 rounded-full flex items-center justify-center shrink-0 border border-amber-500/30 relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
            <Sparkles className="w-12 h-12 text-amber-500 relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-amber-400 mb-2">أبهر مستثمرك قبل أن يتحدث!</h2>
            <p className="text-slate-300 leading-relaxed text-sm max-w-3xl mb-6">
              بدلاً من إرسال ملفات PDF مملة عبر الواتساب، يمكنك الآن إرسال <strong className="text-white">رابط عرض سينمائي مخصص</strong> لكل مشروع. 
              الرابط يعرض تفاصيل المشروع بتأثيرات بصرية حديثة، ويعرض حاسبة عوائد تفاعلية (ROI) تخطف الأنفاس.
            </p>
            <div className="flex gap-4">
               <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> جاهز للإرسال
               </span>
               <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                 <LayoutTemplate className="w-4 h-4" /> تصميم Awwwards
               </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {properties.map(property => {
            const available = property.units.filter((u: any) => u.status === 'AVAILABLE').length;
            const sold = property.units.filter((u: any) => u.status === 'SOLD').length;
            
            return (
              <div key={property.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl group">
                <div className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('/images/masterplan_project.png')] bg-cover bg-center opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                  
                  <Presentation className="w-16 h-16 text-slate-700 relative z-10" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{property.name}</h3>
                  <div className="flex justify-between items-center text-sm text-slate-400 mb-6">
                    <span>متاح: <b className="text-emerald-400">{available}</b> وحدة</span>
                    <span>مباع: <b className="text-rose-400">{sold}</b> وحدة</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleCopy(property.id)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700 flex justify-center items-center gap-2"
                    >
                      {copiedId === property.id ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <LinkIcon className="w-5 h-5" />}
                      {copiedId === property.id ? 'تم النسخ' : 'نسخ الرابط'}
                    </button>
                    
                    <Link 
                      href={`/vip-pitch/${property.id}`}
                      target="_blank"
                      className="flex-[2] bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex justify-center items-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      معاينة العرض
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
