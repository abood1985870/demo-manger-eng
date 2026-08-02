'use client';

import { useState } from 'react';
import { Building2, Receipt, CircleDollarSign, AlertCircle, FileText, CheckCircle2, TrendingUp, Maximize, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';

export default function ClientDashboard({ client, units, invoices }: { client: any, units: any[], invoices: any[] }) {
  const [activeTab, setActiveTab] = useState<'units' | 'financials'>('units');

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalUnpaid = invoices.filter(i => i.status !== 'paid').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="px-6 space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-900/50 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">أهلاً بك، {client.name}</h1>
            <p className="text-slate-400">تابع أصولك العقارية، التزاماتك المالية، وتقدم البناء بشفافية تامة.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center min-w-[120px]">
              <p className="text-xs text-slate-500 font-bold mb-1">إجمالي الأصول</p>
              <p className="text-xl font-black text-amber-400">{units.length} <span className="text-sm font-normal text-slate-400">وحدة</span></p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center min-w-[120px]">
              <p className="text-xs text-slate-500 font-bold mb-1">المدفوعات</p>
              <p className="text-xl font-black text-emerald-400">{(totalPaid / 1000000).toFixed(2)}M <span className="text-sm font-normal text-slate-400">ر.س</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-px">
        <button 
          onClick={() => setActiveTab('units')}
          className={`pb-4 px-4 font-bold transition-all text-sm flex items-center gap-2 border-b-2 ${activeTab === 'units' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Building2 className="w-4 h-4" /> محفظة العقارات
        </button>
        <button 
          onClick={() => setActiveTab('financials')}
          className={`pb-4 px-4 font-bold transition-all text-sm flex items-center gap-2 border-b-2 ${activeTab === 'financials' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Receipt className="w-4 h-4" /> الكشوفات المالية
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'units' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {units.map((unit) => {
              const latestReport = unit.Property?.WafiProgressReport?.[0];
              const progress = latestReport ? latestReport.approvedProgressPercentage : (unit.Property?.status === 'COMPLETED' ? 100 : 0);

              return (
                <div key={unit.id} className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl group hover:border-amber-500/30 transition-colors">
                  <div className="h-48 relative overflow-hidden bg-slate-800">
                    <Image 
                      src={unit.Property?.type === 'BUILDING' ? '/images/tower_project.png' : '/images/villa_project.png'} 
                      alt="Property" 
                      layout="fill" 
                      objectFit="cover"
                      className="opacity-60 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-amber-400 font-bold mb-1">{unit.Property.name}</p>
                        <h2 className="text-2xl font-black text-white">وحدة #{unit.unitNumber}</h2>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                        مباعة
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-white/5">
                      <div className="text-center flex-1 border-l border-white/5">
                        <span className="block text-xs text-slate-500 font-bold mb-1">المساحة</span>
                        <span className="text-white font-bold flex items-center justify-center gap-1"><Maximize className="w-3.5 h-3.5 text-slate-400"/> {unit.area} م²</span>
                      </div>
                      <div className="text-center flex-1">
                        <span className="block text-xs text-slate-500 font-bold mb-1">السعر</span>
                        <span className="text-amber-400 font-bold flex items-center justify-center gap-1"><CircleDollarSign className="w-3.5 h-3.5 text-slate-400"/> {unit.price?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Construction Progress (Wafi Linked) */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" /> نسبة الإنجاز المعتمدة (وافي)
                        </h3>
                        <span className="text-emerald-400 font-black">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                      {latestReport && (
                        <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> تم الاعتماد بواسطة: {latestReport.engineeringConsultant}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {units.length === 0 && (
              <div className="col-span-full p-12 text-center bg-slate-900 border border-dashed border-white/10 rounded-3xl text-slate-500">
                لا توجد وحدات عقارية مرتبطة بحسابك حالياً.
              </div>
            )}
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-bold mb-1">المبالغ المسددة</p>
                  <p className="text-3xl font-black text-white">{totalPaid.toLocaleString()} <span className="text-sm font-normal text-slate-500">ر.س</span></p>
                </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-rose-500/20 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl"></div>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center relative z-10">
                  <Clock className="w-8 h-8 text-rose-400" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm text-slate-400 font-bold mb-1">الرصيد المستحق (غير مسدد)</p>
                  <p className="text-3xl font-black text-rose-400">{totalUnpaid.toLocaleString()} <span className="text-sm font-normal text-rose-500/50">ر.س</span></p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-bold text-white">كشف الدفعات والفواتير</h3>
              </div>
              <div className="divide-y divide-white/5">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">فاتورة دفعة عقارية #{invoice.id.slice(0, 6)}</p>
                        <p className="text-xs text-slate-500 mt-1">تاريخ الاستحقاق: {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-left">
                        <p className="font-black text-lg text-white">{invoice.amount.toLocaleString()} ر.س</p>
                      </div>
                      {invoice.status === 'paid' ? (
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                          مسددة
                        </span>
                      ) : (
                        <button className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all">
                          سداد الآن
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
