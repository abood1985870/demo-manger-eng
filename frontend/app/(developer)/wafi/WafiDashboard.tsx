'use client';

import { useState } from 'react';
import { ShieldCheck, Building2, TrendingUp, Search, Plus, CheckCircle2, AlertTriangle, FileText, ChevronRight, Landmark, UploadCloud, Clock, Check } from 'lucide-react';

const statusNames: Record<string, string> = {
  'ACTIVE': 'نشط ومفعل',
  'FROZEN': 'مجمد',
  'CLOSED': 'مغلق',
};

const reportStatusNames: Record<string, string> = {
  'PENDING': 'قيد الاعتماد من وافي',
  'APPROVED': 'معتمد - متاح للصرف',
  'REJECTED': 'مرفوض',
};

const statusColors: Record<string, string> = {
  'ACTIVE': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'FROZEN': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'CLOSED': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'PENDING': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'APPROVED': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'REJECTED': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export default function WafiDashboard({ properties }: { properties: any[] }) {
  const [selectedProperty, setSelectedProperty] = useState<any | null>(properties[0] || null);

  const totalEscrowDeposits = properties.reduce((acc, p) => acc + (p.wafiEscrowAccount?.totalDeposits || 0), 0);
  const totalAvailable = properties.reduce((acc, p) => acc + (p.wafiEscrowAccount?.availableBalance || 0), 0);
  const totalRetained = properties.reduce((acc, p) => acc + (p.wafiEscrowAccount?.retainedBalance || 0), 0);

  return (
    <>
      <header className="rusukh-page-header border-b border-slate-800 pb-8 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10 px-8 pt-8">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-l from-blue-300 to-emerald-500 bg-clip-text text-transparent mb-2">منصة وافي للبيع على الخارطة</h1>
          <p className="text-slate-400 text-sm">إدارة حسابات الضمان، المبالغ المحتفظ بها، واعتماد نسب الإنجاز الهندسية</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] font-medium text-sm">
            <UploadCloud className="w-4 h-4" /> رفع تقرير هندسي جديد
          </button>
        </div>
      </header>

      <section className="p-8">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium">إجمالي الإيداعات (حسابات الضمان)</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><Landmark className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white flex items-baseline gap-1">
              {(totalEscrowDeposits / 1000000).toFixed(2)} <span className="text-sm text-slate-500 font-normal">مليون ر.س</span>
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium">الرصيد المتاح للصرف (حسب الإنجاز)</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-emerald-400"><CheckCircle2 className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white flex items-baseline gap-1">
              {(totalAvailable / 1000000).toFixed(2)} <span className="text-sm text-slate-500 font-normal">مليون ر.س</span>
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium">الرصيد المحتجز (15% أو أخرى)</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-amber-400"><ShieldCheck className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white flex items-baseline gap-1">
              {(totalRetained / 1000000).toFixed(2)} <span className="text-sm text-slate-500 font-normal">مليون ر.س</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Projects Sidebar */}
          <div className="w-full lg:w-1/3 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">مشاريع البيع على الخارطة</h2>
            {properties.map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelectedProperty(p)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  selectedProperty?.id === p.id 
                    ? 'bg-slate-800 border-emerald-500/50 shadow-lg' 
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-100">{p.name}</h3>
                  <ChevronRight className={`w-5 h-5 ${selectedProperty?.id === p.id ? 'text-emerald-400' : 'text-slate-600'}`} />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-4">
                  <span>حساب الضمان:</span>
                  <span className="text-slate-300">{p.wafiEscrowAccount?.accountNumber || 'غير متوفر'}</span>
                </div>
                
                {p.wafiEscrowAccount && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">البنك</span>
                      <span className="text-emerald-400 font-bold">{p.wafiEscrowAccount.bankName}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Project Details Panel */}
          <div className="w-full lg:w-2/3">
            {selectedProperty && selectedProperty.wafiEscrowAccount ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                
                {/* Account Details */}
                <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-900 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Landmark className="w-48 h-48" />
                  </div>
                  
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border mb-3 ${statusColors[selectedProperty.wafiEscrowAccount.status]}`}>
                        حالة الحساب: {statusNames[selectedProperty.wafiEscrowAccount.status]}
                      </span>
                      <h2 className="text-2xl font-black text-white">{selectedProperty.name}</h2>
                      <p className="text-slate-400 font-mono text-sm mt-1">{selectedProperty.wafiEscrowAccount.accountNumber} — {selectedProperty.wafiEscrowAccount.bankName}</p>
                    </div>
                    
                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-all font-medium text-sm border border-slate-700">
                      إدارة الحساب البنكي
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                      <span className="text-slate-400 text-sm font-bold flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> الرصيد المتاح للصرف</span>
                      <span className="text-3xl font-black text-emerald-400">{selectedProperty.wafiEscrowAccount.availableBalance.toLocaleString()} <span className="text-sm font-normal text-slate-500">ر.س</span></span>
                      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-xs">
                        <span className="text-slate-500">إجمالي الإيداعات</span>
                        <span className="text-white font-bold">{selectedProperty.wafiEscrowAccount.totalDeposits.toLocaleString()} ر.س</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                      <span className="text-slate-400 text-sm font-bold flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-amber-500" /> الرصيد المحتجز (ضمان)</span>
                      <span className="text-3xl font-black text-amber-400">{selectedProperty.wafiEscrowAccount.retainedBalance.toLocaleString()} <span className="text-sm font-normal text-slate-500">ر.س</span></span>
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">يمثل 15% من قيمة الإيداعات كضمان بنكي</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Reports */}
                <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-900">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">تقارير الإنجاز الهندسية (المرتبطة بوافي)</h3>
                  </div>

                  <div className="space-y-4">
                    {selectedProperty.wafiProgressReports?.map((report: any, idx: number) => (
                      <div key={report.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-slate-600 transition-colors">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-lg text-emerald-400">
                            {report.approvedProgressPercentage}%
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">شهادة إنجاز هندسي (رقم #{report.id.slice(0, 5).toUpperCase()})</p>
                            <p className="text-xs text-slate-500 font-mono mt-1">
                              {new Date(report.reportDate).toLocaleDateString('ar-SA')} — {report.engineeringConsultant}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusColors[report.status]}`}>
                            {reportStatusNames[report.status]}
                          </span>
                          <button className="text-slate-400 hover:text-white p-2 bg-slate-900 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors" title="عرض الشهادة">
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {(!selectedProperty.wafiProgressReports || selectedProperty.wafiProgressReports.length === 0) && (
                      <div className="text-center p-8 bg-slate-950 rounded-2xl border border-slate-800 border-dashed">
                        <p className="text-slate-500 text-sm">لا توجد تقارير هندسية مرفوعة لهذا المشروع حتى الآن.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-card p-12 rounded-3xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center text-center h-full">
                <AlertTriangle className="w-16 h-16 text-amber-500 mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">لا يوجد حساب ضمان (وافي)</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  هذا المشروع غير خاضع حالياً للبيع على الخارطة، أو لم يتم ربط حساب الضمان به بعد.
                </p>
                <button className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl transition-all font-medium text-sm border border-slate-700">
                  ربط المشروع بوافي
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
