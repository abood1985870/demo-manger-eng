'use client';

import { FormEvent, useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (newPassword.length < 8) return setError('يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.');
    if (newPassword !== confirmation) return setError('تأكيد كلمة المرور غير مطابق.');
    setSaving(true);
    try {
      const response = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await response.json();
      if (!response.ok) return setError(data.error || 'تعذر تغيير كلمة المرور.');
      window.location.assign('/');
    } catch { setError('تعذر الاتصال بالنظام.'); }
    finally { setSaving(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 font-cairo" dir="rtl"><form onSubmit={submit} className="glass-card w-full max-w-md rounded-3xl border border-amber-500/20 p-8"><KeyRound className="mb-4 h-8 w-8 text-amber-400" /><h1 className="text-xl font-extrabold text-slate-100">تغيير كلمة المرور</h1><p className="mt-2 text-sm text-slate-400">تم تعيين كلمة مرور مؤقتة لحسابك. اختر كلمة مرور جديدة للمتابعة.</p>{error && <p role="alert" className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}<div className="mt-6 space-y-4"><input aria-label="كلمة المرور المؤقتة" type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="كلمة المرور المؤقتة" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100" /><input aria-label="كلمة المرور الجديدة" type="password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100" /><input aria-label="تأكيد كلمة المرور" type="password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="تأكيد كلمة المرور" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100" /><button disabled={saving} className="gold-gradient-bg flex w-full justify-center rounded-xl py-3 text-sm font-extrabold text-slate-950 disabled:opacity-50">{saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}حفظ كلمة المرور</button></div></form></main>;
}
