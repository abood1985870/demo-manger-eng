'use client';

import { useState, useEffect } from 'react';
import { BrainCircuit, LineChart, Target, Zap, ShieldCheck, Activity, ChevronLeft, Building2, AlertTriangle } from 'lucide-react';

export default function RusukhAiEngine() {
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState('جارٍ تهيئة المحرك الاصطناعي...');

  useEffect(() => {
    // Fake the scanning process for the WOW effect
    const texts = [
      'جارٍ تهيئة المحرك الاصطناعي...',
      'يتم تحليل بيانات حسابات الضمان (وافي)...',
      'يتم قراءة التدفقات النقدية والفوترة الإلكترونية...',
      'يتم التنبؤ بتسارع المبيعات بناءً على أداء السوق...',
      'جارٍ بناء التوصيات المالية والهندسية...',
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 800);
          return 100;
        }
        
        // Update text based on progress
        const expectedStep = Math.floor((p / 100) * texts.length);
        if (expectedStep > currentStep && expectedStep < texts.length) {
          currentStep = expectedStep;
          setScanText(texts[currentStep]);
        }
        
        // Random progress increments for realism
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (isScanning) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-8 font-cairo overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950"></div>
        
        <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-amber-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BrainCircuit className="w-12 h-12 text-amber-400 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Rusukh AI Engine</h2>
          <p className="text-amber-500/80 font-mono text-sm mb-6 h-6 animate-pulse">{scanText}</p>
          
          <div className="w-full bg-slate-900 rounded-full h-2 mb-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300 ease-out" style={{ width: `${scanProgress}%` }}></div>
          </div>
          <p className="text-slate-500 text-xs font-mono text-right w-full">{scanProgress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 font-cairo max-w-7xl mx-auto w-full animate-in fade-in zoom-in-95 duration-1000 relative">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full"></div>

      <header className="mb-10 flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 animate-pulse">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-white">المستشار المالي الذكي</h1>
          </div>
          <p className="text-slate-400">تحليل مالي وهندسي استباقي لمنع تعثر المشاريع وزيادة الربحية</p>
        </div>
        <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Activity className="w-4 h-4" />
          <span>Real-time Analysis</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Main Recommendation (The Hero Card) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-white">توصية استراتيجية عاجلة</h2>
          </div>
          
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 mb-6">
            <h3 className="text-2xl font-black text-amber-400 mb-3 leading-tight">
              أصدر مستخلص مقاول "برج رسوخ" <br/> لعدم تعطيل المبيعات.
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              بناءً على التقرير الهندسي الأخير، نسبة إنجاز المقاول الفعلي (35%) تتجاوز نسبة الإنجاز في جدول الدفعات (30%). النظام يتوقع <b>تعثر المشروع جزئياً خلال 14 يوم</b> في حال تأخر صرف الدفعة من حساب الضمان، مما سيؤثر على سيولة المبيعات المستقبلية.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:-translate-y-0.5 flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4" /> الموافقة والصرف من وافي
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl transition-all border border-slate-700 text-sm">
              عرض التقرير الهندسي التفصيلي
            </button>
          </div>
        </div>

        {/* Sales Velocity Predicition */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">تسارع المبيعات</h2>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">Prediction</span>
            </div>
            
            <div className="text-center py-6">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-200 to-emerald-500 mb-2">96 <span className="text-2xl">يوم</span></div>
              <p className="text-sm font-bold text-slate-400">لتصريف المخزون بالكامل</p>
            </div>
            
            <div className="space-y-4 text-sm mt-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-slate-500">المشروع</span>
                <span className="text-white font-bold">برج المطور</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-slate-500">معدل البيع الأسبوعي</span>
                <span className="text-emerald-400 font-bold">+12 وحدة</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800">
             <p className="text-xs text-slate-500 leading-relaxed">
               توصية الذكاء الاصطناعي: <strong className="text-emerald-400">زيادة أسعار الوحدات المتبقية بنسبة 5%</strong> نظراً لارتفاع الطلب.
             </p>
          </div>
        </div>

        {/* Cashflow Prediction */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">تحليل التدفق النقدي المستقبلي (Cash Burn)</h2>
            </div>
            <select className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none">
              <option>الربع القادم (Q4)</option>
              <option>الأشهر الستة القادمة</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
               <p className="text-xs text-slate-500 font-bold mb-1">السيولة المتاحة حالياً</p>
               <p className="text-xl font-black text-white">45.2M <span className="text-xs text-slate-500 font-normal">SAR</span></p>
            </div>
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 border-l-4 border-l-rose-500">
               <p className="text-xs text-slate-500 font-bold mb-1">الالتزامات القادمة (3 أشهر)</p>
               <p className="text-xl font-black text-rose-400">-12.8M <span className="text-xs text-slate-500 font-normal">SAR</span></p>
            </div>
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 border-l-4 border-l-emerald-500">
               <p className="text-xs text-slate-500 font-bold mb-1">التحصيلات المتوقعة (3 أشهر)</p>
               <p className="text-xl font-black text-emerald-400">+28.5M <span className="text-xs text-slate-500 font-normal">SAR</span></p>
            </div>
            <div className="bg-slate-950 rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
               <p className="text-xs text-emerald-400 font-bold mb-1">الوضع المالي المتبقي</p>
               <p className="text-xl font-black text-white">60.9M <span className="text-xs text-emerald-500 font-normal">SAR</span></p>
            </div>
          </div>
          
          {/* Fake Visual Chart Bar */}
          <div className="relative w-full h-40 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden p-6 flex flex-col justify-end">
             {/* Chart grid lines */}
             <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
               <div className="border-b border-slate-800/50 w-full h-px"></div>
               <div className="border-b border-slate-800/50 w-full h-px"></div>
               <div className="border-b border-slate-800/50 w-full h-px"></div>
             </div>
             
             {/* Chart Bars */}
             <div className="flex items-end justify-between w-full h-24 gap-2 relative z-10">
               {[40, 55, 30, 80, 65, 90, 75, 45, 60, 85, 70, 95].map((height, i) => (
                 <div key={i} className="w-full relative group">
                   <div 
                     className="absolute bottom-0 w-full rounded-t-sm transition-all duration-1000 ease-in-out group-hover:brightness-125"
                     style={{ 
                       height: `${height}%`, 
                       background: height > 70 ? 'linear-gradient(to top, #064e3b, #10b981)' : height > 40 ? 'linear-gradient(to top, #1e3a8a, #3b82f6)' : 'linear-gradient(to top, #7f1d1d, #ef4444)'
                     }}
                   ></div>
                 </div>
               ))}
             </div>
          </div>
          <div className="flex justify-between items-center mt-2 px-2 text-[10px] font-bold text-slate-500 font-mono">
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
          </div>

        </div>
        
      </div>
    </div>
  );
}
