'use client';

import { 
  Building2, 
  CircleDollarSign, 
  TrendingUp, 
  CheckCircle2, 
  PackageSearch,
  Landmark,
  ArrowUpRight,
  Activity,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function ExecutiveDashboard({ 
  properties, 
  units, 
  invoices 
}: { 
  properties: any[], 
  units: any[], 
  invoices: any[] 
}) {
  
  // Aggregate calculations
  const totalUnits = units.length;
  const soldUnits = units.filter(u => u.status === 'SOLD').length;
  const availableUnits = units.filter(u => u.status === 'AVAILABLE').length;

  const totalSalesValue = units.filter(u => u.status === 'SOLD').reduce((sum, u) => sum + (u.price || 0), 0);
  const totalInventoryValue = units.reduce((sum, u) => sum + (u.price || 0), 0);

  const totalEscrowAvailable = properties.reduce((sum, p) => sum + (p.wafiEscrowAccount?.availableBalance || 0), 0);
  const totalEscrowRetained = properties.reduce((sum, p) => sum + (p.wafiEscrowAccount?.retainedBalance || 0), 0);
  
  const totalInvoicesPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

  const totalLiquidity = totalEscrowAvailable + totalInvoicesPaid;
  const salesPercentage = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;

  return (
    <>
      <header className="rusukh-page-header border-b border-slate-800 pb-8 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10 px-8 pt-8">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-l from-amber-200 to-amber-500 bg-clip-text text-transparent mb-2">اللوحة التنفيذية</h1>
            <p className="text-slate-400 text-sm">نبض الشركة — ملخص المبيعات، السيولة، والإنجازات</p>
          </div>
          <div className="flex gap-4">
            <span className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              تحديث فوري
            </span>
          </div>
        </div>
      </header>

      <section className="p-8 space-y-8">
        
        {/* Tier 1: Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="text-slate-400 font-bold text-sm">إجمالي المبيعات المحققة</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-emerald-400"><TrendingUp className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white flex items-baseline gap-1 relative z-10">
              {(totalSalesValue / 1000000).toFixed(2)} <span className="text-sm text-slate-500 font-normal">مليون ر.س</span>
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-amber-500/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="text-slate-400 font-bold text-sm">السيولة النقدية المتاحة</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-amber-400"><CircleDollarSign className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white flex items-baseline gap-1 relative z-10">
              {(totalLiquidity / 1000000).toFixed(2)} <span className="text-sm text-slate-500 font-normal">مليون ر.س</span>
            </p>
            <p className="text-xs text-slate-500 mt-2 font-mono flex items-center gap-1"><Landmark className="w-3 h-3"/> يشمل حسابات وافي والفواتير</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="text-slate-400 font-bold text-sm">الضمانات المحتجزة (وافي)</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><CheckCircle2 className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white flex items-baseline gap-1 relative z-10">
              {(totalEscrowRetained / 1000000).toFixed(2)} <span className="text-sm text-slate-500 font-normal">مليون ر.س</span>
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-purple-500/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="text-slate-400 font-bold text-sm">معدل تصريف المخزون</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-purple-400"><PackageSearch className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white relative z-10">
              {salesPercentage}%
            </p>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 relative z-10">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${salesPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Health */}
          <div className="col-span-1 lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-amber-500" /> لوحة المشاريع النشطة</h2>
              <Link href="/matters" className="text-sm text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1">عرض الكل <ArrowUpRight className="w-4 h-4"/></Link>
            </div>
            
            <div className="space-y-6">
              {properties.slice(0, 4).map(p => {
                const pUnits = p.units || [];
                const pSold = pUnits.filter((u:any) => u.status === 'SOLD').length;
                const pTotal = pUnits.length;
                const pSalesPercent = pTotal > 0 ? Math.round((pSold / pTotal) * 100) : 0;
                
                const latestReport = p.wafiProgressReports?.[0];
                const constructionProgress = latestReport ? latestReport.approvedProgressPercentage : (p.status === 'COMPLETED' ? 100 : 0);

                return (
                  <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-lg text-slate-100">{p.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{p.type === 'BUILDING' ? 'برج سكني' : 'مجمع وحدات'}</p>
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${p.status === 'UNDER_CONSTRUCTION' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                        {p.status === 'PLANNING' ? 'تخطيط' : p.status === 'UNDER_CONSTRUCTION' ? 'تحت الإنشاء' : 'مكتمل'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-slate-400">إنجاز البناء (وافي)</span>
                          <span className="text-emerald-400">{constructionProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${constructionProgress}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-slate-400">المبيعات</span>
                          <span className="text-blue-400">{pSalesPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pSalesPercent}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Center */}
          <div className="col-span-1 bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-8"><AlertTriangle className="w-5 h-5 text-rose-500" /> مركز التنبيهات</h2>
            
            <div className="flex-1 space-y-4">
              {properties.filter(p => p.wafiEscrowAccount && p.wafiEscrowAccount.availableBalance > 5000000).slice(0, 2).map(p => (
                <div key={p.id} className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-4 items-start">
                  <div className="bg-amber-500/20 p-2 rounded-lg"><Landmark className="w-4 h-4 text-amber-400" /></div>
                  <div>
                    <p className="text-sm font-bold text-amber-400 mb-1">تراكم نقدي في وافي</p>
                    <p className="text-xs text-slate-400">يوجد رصيد متاح للصرف يتجاوز 5 ملايين ريال في حساب مشروع {p.name}. يرجى تقديم طلب صرف.</p>
                  </div>
                </div>
              ))}
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-start">
                <div className="bg-blue-500/20 p-2 rounded-lg"><TrendingUp className="w-4 h-4 text-blue-400" /></div>
                <div>
                  <p className="text-sm font-bold text-blue-400 mb-1">تسارع مبيعات إيجابي</p>
                  <p className="text-xs text-slate-400">مشروع "برج رسوخ" حقق نسبة مبيعات ممتازة، يرجى تحديث أسعار الوحدات المتبقية لتعظيم الأرباح.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </>
  );
}
