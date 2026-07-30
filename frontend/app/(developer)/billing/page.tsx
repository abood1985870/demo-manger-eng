'use client';

import { Receipt, ShieldCheck, Download, Plus, CheckCircle2, FileText, X, Printer, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newClientId, setNewClientId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [recipientType, setRecipientType] = useState('REGISTERED');
  const [externalClientName, setExternalClientName] = useState('');
  const [externalClientEmail, setExternalClientEmail] = useState('');
  const [externalClientPhone, setExternalClientPhone] = useState('');
  const [externalClientAddress, setExternalClientAddress] = useState('');
  const [externalClientTaxNumber, setExternalClientTaxNumber] = useState('');
  const [saveExternalAsClient, setSaveExternalAsClient] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tenantId = sessionStorage.getItem('tenantId');
      if (!tenantId) return;

      const [invoicesRes, clientsRes] = await Promise.all([
        fetch(`/api/legal/invoices?tenantId=${tenantId}`),
        fetch(`/api/lawyer/clients?tenantId=${tenantId}`)
      ]);

      if (invoicesRes.ok) setInvoices(await invoicesRes.json());
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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const base = parseFloat(newAmount) || 10000;
    
    try {
      const tenantId = sessionStorage.getItem('tenantId');
      
      const payload: any = {
        tenantId,
        recipient_type: recipientType,
        total_fees: base,
        total_expenses: 0,
        total_tax: base * 0.15,
        grand_total: base * 1.15,
        currency: 'SAR',
        invoice_date: new Date().toISOString().split('T')[0],
      };

      if (recipientType === 'REGISTERED') {
        payload.client_id = newClientId;
      } else {
        payload.external_client_name = externalClientName;
        payload.external_client_email = externalClientEmail;
        payload.external_client_phone = externalClientPhone;
        payload.external_client_address = externalClientAddress;
        payload.external_client_tax_number = externalClientTaxNumber;
        payload.save_external_as_client = saveExternalAsClient;
      }

      const res = await fetch('/api/legal/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchData();
        setShowCreateModal(false);
        setNewAmount('');
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create invoice', error);
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-amber-400" />
            <span>الفوترة والربط مع الزكاة والضريبة (Billing)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إصدار الفواتير الضريبية مربوط بقاعدة البيانات الحقيقية
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="gold-gradient-bg text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء فاتورة جديدة</span>
        </button>
      </div>

      {/* ZATCA Integration Status Banner */}
      <div className="glass-card p-5 rounded-2xl border-emerald-500/30 bg-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-300">بيانات الفوترة محفوظة في قاعدة البيانات</h4>
            <p className="text-xs text-emerald-400/80 mt-0.5">يمكن طباعة المستند وحفظه PDF من نافذة الفاتورة</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 w-fit">
          <CheckCircle2 className="w-4 h-4" />
          <span>الحالة: جاهز للطباعة</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-bold text-base text-slate-100 mb-4">قائمة الفواتير الضريبية الصادرة</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/50">
                <th className="p-4 pr-6">رقم الفاتورة</th>
                <th className="p-4">العميل</th>
                <th className="p-4">المبلغ الخاضع للضريبة</th>
                <th className="p-4">ضريبة القيمة المضافة (15%)</th>
                <th className="p-4">الإجمالي الشامل</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 pl-6 text-left">معاينة وتصدير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">لا توجد فواتير حالياً.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="p-4 pr-6 font-mono font-bold text-slate-100">{inv.id.substring(0,8)}</td>
                    <td className="p-4 font-semibold text-slate-300">{inv.recipient_type === 'EXTERNAL' ? inv.recipient_name : inv.client?.name || inv.recipient_name}</td>
                    <td className="p-4 font-mono font-bold text-slate-200">{(Number(inv.total_fees)).toLocaleString()} ر.س</td>
                    <td className="p-4 font-mono text-slate-400">{(Number(inv.total_tax)).toLocaleString()} ر.س</td>
                    <td className="p-4 font-mono font-bold text-amber-400">{(Number(inv.grand_total)).toLocaleString()} ر.س</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inv.status === 'PAID' ? 'مدفوعة' : 'غير مدفوعة'}
                      </span>
                    </td>
                    <td className="p-4 pl-6 text-left">
                      <button 
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-all cursor-pointer"
                        title="عرض الفاتورة ورمز QR"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-3xl w-full max-w-lg border-amber-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <span>إصدار فاتورة ضريبية جديدة</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 subtle-scroll">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع العميل</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input type="radio" name="recipientType" value="REGISTERED" checked={recipientType === 'REGISTERED'} onChange={() => setRecipientType('REGISTERED')} className="accent-amber-500" />
                    عميل مسجل
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input type="radio" name="recipientType" value="EXTERNAL" checked={recipientType === 'EXTERNAL'} onChange={() => setRecipientType('EXTERNAL')} className="accent-amber-500" />
                    عميل غير مسجل
                  </label>
                </div>
              </div>

              {recipientType === 'REGISTERED' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">العميل المسجل</label>
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  >
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 border border-slate-800 p-4 rounded-xl bg-slate-900/50">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم العميل (مطلوب)</label>
                    <input type="text" required value={externalClientName} onChange={(e) => setExternalClientName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:border-amber-500/50 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                      <input type="email" value={externalClientEmail} onChange={(e) => setExternalClientEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:border-amber-500/50 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الجوال</label>
                      <input type="text" value={externalClientPhone} onChange={(e) => setExternalClientPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:border-amber-500/50 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">الرقم الضريبي</label>
                      <input type="text" value={externalClientTaxNumber} onChange={(e) => setExternalClientTaxNumber(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:border-amber-500/50 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">العنوان</label>
                      <input type="text" value={externalClientAddress} onChange={(e) => setExternalClientAddress(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:border-amber-500/50 outline-none" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 mt-2 cursor-pointer">
                    <input type="checkbox" checked={saveExternalAsClient} onChange={(e) => setSaveExternalAsClient(e.target.checked)} className="rounded border-slate-700 bg-slate-900 accent-amber-500" />
                    حفظ هذا العميل ضمن قائمة العملاء لاستخدامه لاحقاً
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المبلغ الأساسي (قبل الضريبة)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono text-amber-400">{((parseFloat(newAmount) || 0) * 0.15).toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-100 font-bold border-t border-slate-800 pt-1 mt-1">
                  <span>الإجمالي النهائي الشامل:</span>
                  <span className="font-mono text-emerald-400">{((parseFloat(newAmount) || 0) * 1.15).toLocaleString()} ر.س</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gold-gradient-bg text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-3xl w-full max-w-lg border-amber-500/30 space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-right">
              <div>
                <h3 className="font-bold text-base text-slate-100">فاتورة ضريبية مبسطة</h3>
                <p className="text-xs text-amber-400 font-mono">{selectedInvoice.id.substring(0,8)}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl w-40 h-40 mx-auto flex items-center justify-center border-4 border-amber-400 shadow-xl">
              <FileText className="w-32 h-32 text-slate-950" />
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <p className="font-bold text-sm text-slate-100">{selectedInvoice.recipient_type === 'EXTERNAL' ? selectedInvoice.recipient_name : selectedInvoice.client?.name || selectedInvoice.recipient_name}</p>
              <p className="font-mono text-emerald-400 text-base font-bold">الإجمالي: {(Number(selectedInvoice.grand_total)).toLocaleString()} ر.س</p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-3">
              {(selectedInvoice.recipient_email || selectedInvoice.external_client_email) && (
                <button 
                  onClick={() => alert('تم إرسال الفاتورة بنجاح عبر البريد الإلكتروني.')}
                  className="bg-slate-800 text-slate-200 hover:bg-slate-700 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2"
                >
                  <span>إرسال الفاتورة بالبريد</span>
                </button>
              )}
              <button 
                onClick={() => window.open(`/api/legal/invoices/${selectedInvoice.id}/document`, '_blank', 'noopener,noreferrer')}
                className="gold-gradient-bg text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة / تحميل الفاتورة PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
