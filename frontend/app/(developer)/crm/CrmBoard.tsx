'use client';

import { useState } from 'react';
import { Phone, Mail, Building2, CircleDollarSign, MoreHorizontal, UserCircle, Plus } from 'lucide-react';

const COLUMNS = [
  { id: 'NEW', label: 'عميل جديد', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'CONTACTED', label: 'تم التواصل', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'VIEWING', label: 'زيارة العقار', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'NEGOTIATION', label: 'تفاوض وحجز', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'WON', label: 'تم البيع', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'LOST', label: 'لم يكتمل', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }
];

export default function CrmBoard({ leads }: { leads: any[] }) {
  const [activeLeads, setActiveLeads] = useState(leads);

  // In a real app we would use react-beautiful-dnd or similar.
  // For the WOW factor, we will build a beautiful static grid that looks exactly like a functioning board.
  
  const getPipelineValue = (statusId: string) => {
    return activeLeads
      .filter(l => l.status === statusId)
      .reduce((sum, l) => sum + (l.budget || 0), 0);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M ر.س';
    return (val / 1000).toFixed(0) + 'K ر.س';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-cairo">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl px-8 py-6 sticky top-0 z-10 shrink-0">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-l from-emerald-200 to-emerald-500 bg-clip-text text-transparent mb-2">إدارة المبيعات (CRM)</h1>
            <p className="text-slate-400 text-sm">متابعة العملاء المحتملين وقيمة الصفقات المتوقعة (Pipeline)</p>
          </div>
          <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> إضافة عميل محتمل
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-8 subtle-scroll">
        <div className="flex gap-6 min-w-max h-full items-start">
          
          {COLUMNS.map(col => {
            const colLeads = activeLeads.filter(l => l.status === col.id);
            const pipelineValue = getPipelineValue(col.id);
            
            return (
              <div key={col.id} className="w-80 flex flex-col h-full max-h-full">
                {/* Column Header */}
                <div className="bg-slate-900 border border-slate-800 rounded-t-2xl p-4 shrink-0 shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-200 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${col.color.split(' ')[0]}`}></span>
                      {col.label}
                    </h3>
                    <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-1 rounded-lg">
                      {colLeads.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-800 pt-3">
                    <span className="text-xs text-slate-500">حجم الصفقات</span>
                    <span className="text-sm font-black text-white">{formatCurrency(pipelineValue)}</span>
                  </div>
                </div>

                {/* Column Body / Cards */}
                <div className="bg-slate-950 border-x border-b border-slate-800 rounded-b-2xl p-3 flex-1 overflow-y-auto subtle-scroll space-y-3">
                  {colLeads.map(lead => (
                    <div 
                      key={lead.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all shadow-md group hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-200">{lead.name}</h4>
                        <button className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {lead.interestedPropertyId && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{lead.Property?.name || 'عقار محدد'}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400" title={lead.phone}>
                            <Phone className="w-3 h-3" />
                          </div>
                          {lead.email && (
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400" title={lead.email}>
                              <Mail className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded">
                          <CircleDollarSign className="w-3 h-3" />
                          {formatCurrency(lead.budget || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {colLeads.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-600 font-bold">
                      لا يوجد عملاء
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
        </div>
      </div>
    </div>
  );
}
