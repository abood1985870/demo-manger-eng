'use client';

import { FileText, Shield, Edit3, CheckCircle, Clock, Plus, X, Eye, FileCheck, Lock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newClauses, setNewClauses] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tenantId = sessionStorage.getItem('tenantId');
      if (!tenantId) return;

      const [contractsRes, clientsRes] = await Promise.all([
        fetch(`/api/lawyer/contracts?tenantId=${tenantId}`),
        fetch(`/api/lawyer/clients?tenantId=${tenantId}`)
      ]);

      if (contractsRes.ok) setContracts(await contractsRes.json());
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
        if (clientsData.length > 0) {
          setNewClientId(clientsData[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const tenantId = sessionStorage.getItem('tenantId');
      const res = await fetch('/api/lawyer/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          clientId: newClientId || null,
          title: newName || 'عقد جديد',
          summary: newSummary || '',
          content: newClauses || 'تم تطبيق البنود المعتمدة من دليل صياغة العقود.'
        })
      });

      if (res.ok) {
        await fetchData();
        setShowDraftModal(false);
        setNewName('');
        setNewClauses('');
        setNewSummary('');
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create contract', error);
      alert('حدث خطأ في النظام');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-cairo">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-amber-400" />
            <span>إدارة دورة حياة العقود والاتفاقيات</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            صياغة العقود، مكتبة الشروط والبنود التطويرية، التوقيع الرقمي (مربوط بقاعدة البيانات)
          </p>
        </div>
        <button 
          onClick={() => setShowDraftModal(true)}
          className="gold-gradient-bg text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>صياغة عقد جديد</span>
        </button>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contracts.length === 0 ? (
          <div className="col-span-3 text-center p-12 text-slate-400 glass-card rounded-3xl">
            لا توجد عقود حالياً.
          </div>
        ) : (
          contracts.map((c) => (
            <div key={c.id} className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 relative">
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {c.id.substring(0,8)}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  منخفض
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-100">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  الطرف الثاني: <strong className="text-slate-200">{c.client?.name || 'غير محدد'}</strong>
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {new Date(c.createdAt).toLocaleDateString('ar-SA')}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className={`font-semibold ${c.status === 'signed' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {c.status === 'draft' ? 'مسودة' : c.status === 'signed' ? 'موقّع إلكترونياً' : c.status}
                </span>
                <button 
                  onClick={() => setSelectedContract(c)}
                  className="text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>عرض العقد</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DRAFT NEW CONTRACT MODAL */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-3xl w-full max-w-lg border-amber-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>صياغة عقد جديد</span>
              </h3>
              <button onClick={() => setShowDraftModal(false)} className="text-slate-400 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDraftContract} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">العميل (الطرف الثاني)</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">-- اختياري: بدون عميل محدد --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم العقد / الاتفاقية</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عقد خدمات استشارية وتقنية"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">ملخص العقد (اختياري)</label>
                <textarea
                  rows={2}
                  placeholder="اكتب ملخصاً بسيطاً يوضح غرض العقد..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50 resize-none subtle-scroll"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">البنود الخاصة والاشتراطات</label>
                <textarea
                  rows={4}
                  placeholder="ادخل الشروط الخاصة أو اختر البنود النموذجية..."
                  value={newClauses}
                  onChange={(e) => setNewClauses(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDraftModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gold-gradient-bg text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ العقد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CONTRACT DETAILS MODAL */}
      {selectedContract && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-3xl w-full max-w-xl border-amber-500/30 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-amber-400 font-bold text-xs bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                  {selectedContract.id.substring(0,8)}
                </span>
                <h3 className="font-extrabold text-lg text-slate-100 mt-2">{selectedContract.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  الطرف الثاني: <strong className="text-slate-200">{selectedContract.client?.name}</strong>
                </p>
              </div>
              <button onClick={() => setSelectedContract(null)} className="text-slate-400 hover:text-white font-bold p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>شروط العقد</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedContract.content}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>{selectedContract.status === 'signed' ? 'تم التوقيع' : 'جاهز للتوقيع الرقمي'}</span>
              </span>
              <button 
                onClick={() => setSelectedContract(null)}
                className="gold-gradient-bg text-slate-950 font-extrabold px-5 py-2 rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
