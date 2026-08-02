'use client';

import { useState, useEffect } from 'react';
import { Play, TrendingUp, Sparkles, Building2, MapPin, Calculator, ShieldCheck, ArrowDown } from 'lucide-react';
import Link from 'next/link';

export default function VipPitchClient({ property, availableUnitsCount, soldUnitsCount, averagePrice }: any) {
  const [scrollY, setScrollY] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState<number>(averagePrice || 1000000);
  
  // Calculate ROI
  const expectedAnnualYield = 0.085; // 8.5%
  const capitalAppreciation = 0.12; // 12% over 3 years
  const annualReturn = investmentAmount * expectedAnnualYield;
  const expectedValue3Years = investmentAmount + (investmentAmount * capitalAppreciation);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const imageMap: Record<string, string> = {
    'BUILDING': '/images/tower_project.png',
    'COMPOUND': '/images/villa_project.png',
    'MASTER_PLAN': '/images/masterplan_project.png',
  };
  
  const bgImage = imageMap[property.type] || '/images/masterplan_project.png';

  return (
    <div className="font-cairo selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: \`url('\${bgImage}')\`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            transform: \`translateY(\${scrollY * 0.5}px) scale(1.1)\`,
            filter: 'brightness(0.4)'
          }}
        ></div>
        
        {/* Glass Overlay */}
        <div className="absolute inset-0 z-1 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> فرصة استثمارية حصرية (VIP)
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-6 tracking-tight drop-shadow-2xl">
            {property.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 font-light max-w-3xl mx-auto leading-relaxed mb-12">
            مستقبلك يبدأ هنا. مشروع استثنائي يجمع بين الفخامة المعمارية والعوائد الاستثمارية المضمونة في قلب {property.location || 'المدينة'}.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-lg rounded-2xl transition-all shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105 hover:shadow-[0_0_60px_rgba(245,158,11,0.6)]">
              احجز وحدتك الآن
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 font-bold text-lg rounded-2xl transition-all backdrop-blur-md flex items-center justify-center gap-3">
              <Play className="w-5 h-5 text-amber-500" /> عرض الفيديو التعريفي
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">اكتشف</span>
          <ArrowDown className="w-5 h-5 text-slate-400" />
        </div>
      </section>

      {/* 2. Live Inventory (FOMO Section) */}
      <section className="py-24 bg-slate-950 relative border-b border-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
              <Building2 className="w-10 h-10 text-amber-500 mb-6" />
              <h3 className="text-slate-400 font-medium text-lg mb-2">الوحدات المتاحة للاستثمار</h3>
              <p className="text-5xl font-black text-white flex items-baseline gap-2">
                {availableUnitsCount} <span className="text-xl text-slate-500 font-normal">وحدة فقط</span>
              </p>
              {availableUnitsCount < 10 && (
                <div className="mt-4 text-rose-400 text-sm font-bold flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> ينفد قريباً!
                </div>
              )}
            </div>
            
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
              <TrendingUp className="w-10 h-10 text-emerald-500 mb-6" />
              <h3 className="text-slate-400 font-medium text-lg mb-2">ما تم بيعه حتى الآن</h3>
              <p className="text-5xl font-black text-white flex items-baseline gap-2">
                {soldUnitsCount} <span className="text-xl text-slate-500 font-normal">وحدة</span>
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
              <ShieldCheck className="w-10 h-10 text-blue-500 mb-6" />
              <h3 className="text-slate-400 font-medium text-lg mb-2">حالة التراخيص والضمان</h3>
              <p className="text-2xl font-black text-white mb-2">معتمد من (وافي)</p>
              <p className="text-sm text-slate-400 font-mono">رخصة: {property.wafiLicenseNumber || 'قيد الإصدار'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive ROI Calculator */}
      <section className="py-32 relative overflow-hidden bg-slate-950">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <Calculator className="w-12 h-12 text-amber-500 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">احسب عوائدك الاستثمارية</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">نستخدم خوارزميات الذكاء الاصطناعي لتحليل السوق وتقدير عوائدك بدقة متناهية بناءً على القراءات الحالية.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-16 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Controls */}
              <div className="space-y-12">
                <div>
                  <div className="flex justify-between items-end mb-6">
                    <label className="text-lg font-bold text-slate-300">مبلغ الاستثمار المستهدف (ريال)</label>
                    <span className="text-3xl font-black text-amber-400">{investmentAmount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="500000" 
                    max="10000000" 
                    step="50000"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-3 font-mono">
                    <span>500K</span>
                    <span>10M+</span>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500"/> محددات السوق الذكية</h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">العائد الإيجاري السنوي المتوقع</span>
                      <span className="text-white font-bold">8.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">النمو الرأسمالي (3 سنوات)</span>
                      <span className="text-white font-bold">12.0%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="flex flex-col justify-center gap-8">
                <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border border-amber-500/30 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl"></div>
                  <p className="text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">الدخل الإيجاري السنوي المتوقع</p>
                  <p className="text-5xl font-black text-white">{annualReturn.toLocaleString()} <span className="text-xl text-amber-500 font-normal">ر.س</span></p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/30 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                  <p className="text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">قيمة الأصل بعد 3 سنوات</p>
                  <p className="text-5xl font-black text-white">{expectedValue3Years.toLocaleString()} <span className="text-xl text-emerald-500 font-normal">ر.س</span></p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-24 text-center border-t border-slate-900 bg-slate-950">
        <h2 className="text-3xl font-black text-white mb-8">جاهز لتوقيع عقدك إلكترونياً؟</h2>
        <button className="px-12 py-5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xl rounded-2xl transition-all shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:scale-105">
          تواصل مع مستشارك العقاري
        </button>
        <p className="text-slate-500 mt-12 text-sm font-bold">بنيت هذه المنصة الاستثمارية بواسطة نظام رُسوخ (Rusukh)</p>
      </footer>
    </div>
  );
}
