'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Building2, Loader2, Plus, X } from 'lucide-react';

type Client = { id: string; name: string; email?: string | null; phone?: string | null; type: string; beneficiaryMatters: Array<{ id: string; title: string; caseNumber?: string | null; status: string }> };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', type: 'individual' });
  const [submitting, setSubmitting] = useState(false);

  function fetchClients() {
    setLoading(true);
    fetch('/api/lawyer/clients').then((response) => response.ok ? response.json() : []).then(setClients).finally(() => setLoading(false));
  }

  useEffect(() => { fetchClients(); }, []);

  async function handleAddClient(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/lawyer/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewClient({ name: '', email: '', phone: '', type: 'individual' });
        fetchClients();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !clients.length) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-400" /></div>;
  return (
    <main className="space-y-6 font-cairo" dir="rtl">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-100"><Building2 className="text-amber-400" />حسابات العملاء</h1>
          <p className="mt-2 text-sm text-slate-400">المشاريع المرتبطة بكل حساب مستفيد.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة عميل جديد
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {clients.map((client) => (
          <article key={client.id} className="glass-card rounded-3xl p-6">
            <h2 className="font-bold text-slate-100">{client.name}</h2>
            <p className="mt-1 text-xs text-slate-400">{client.email || 'بدون بريد إلكتروني'} {client.phone && `| ${client.phone}`}</p>
            <h3 className="mt-5 text-sm font-bold text-amber-400">المشاريع المستفيدة</h3>
            {client.beneficiaryMatters.length ? (
              <ul className="mt-3 space-y-2">
                {client.beneficiaryMatters.map((matter) => (
                  <li key={matter.id} className="rounded-xl bg-slate-900 p-3 text-sm text-slate-200">
                    {matter.title}
                    <span className="mr-2 text-xs text-slate-500">{matter.caseNumber || matter.status}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-slate-500">لا توجد مشاريع مرتبطة بهذا الحساب.</p>}
          </article>
        ))}
      </section>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 left-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">إضافة عميل جديد</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم العميل *</label>
                <input required type="text" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                <input type="email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الجوال</label>
                <input type="text" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع العميل</label>
                <select value={newClient.type} onChange={e => setNewClient({ ...newClient, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50">
                  <option value="individual">فرد</option>
                  <option value="company">شركة</option>
                </select>
              </div>
              <button disabled={submitting} type="submit" className="w-full bg-amber-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-amber-600 disabled:opacity-50">
                {submitting ? 'جاري الإضافة...' : 'حفظ العميل'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
