'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, AlertTriangle, Loader2, LogOut, UserCog, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

type TenantData = {
  id: string;
  name: string;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
  createdAt: string;
  _count: { users: number; matters: number };
};

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');

  // Profile modal state
  const [showProfile, setShowProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants');
      if (!res.ok) throw new Error('فشل جلب بيانات المكاتب');
      const data = await res.json();
      setTenants(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile');
      if (res.ok) {
        const data = await res.json();
        setProfileForm({ name: data.name, email: data.email, password: '' });
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      sessionStorage.clear();
      router.push('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !adminEmail || !adminPassword || !adminName) return;

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTenantName, adminEmail, adminPassword, adminName }),
      });
      if (!res.ok) throw new Error('فشل إنشاء المكتب الجديد');
      
      setIsAdding(false);
      setNewTenantName('');
      setAdminEmail('');
      setAdminPassword('');
      setAdminName('');
      fetchTenants(); // Refresh
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionStatus: newStatus }),
      });
      if (res.ok) fetchTenants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const payload: any = { name: profileForm.name, email: profileForm.email };
      if (profileForm.password) payload.password = profileForm.password;

      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('تم تحديث البيانات بنجاح!');
        setShowProfile(false);
      } else {
        const data = await res.json();
        alert(`خطأ: ${data.error}`);
      }
    } catch (e) {
      alert('حدث خطأ في تحديث البيانات');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-400" /></div>;
  if (error) return <div className="glass-card rounded-3xl border border-rose-500/30 p-8 text-rose-200"><AlertTriangle className="mb-3 h-6 w-6" /><h1 className="text-xl font-bold">حدث خطأ</h1><p>{error}</p></div>;

  return (
    <div className="space-y-6 font-cairo max-w-6xl mx-auto p-4 md:p-6 transition-colors duration-300 text-slate-100">
      <header className="glass-card rounded-3xl border border-indigo-500/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-indigo-400">نظام إدارة الاشتراكات (SaaS)</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-slate-100">
            <Building2 className="h-6 w-6 text-indigo-400" /> لوحة تحكم مدير النظام
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ThemeToggle />
          
          <button 
            onClick={() => {
              fetchProfile();
              setShowProfile(true);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserCog className="w-4 h-4"/> إعدادات الحساب
          </button>
          
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isAdding ? 'إلغاء' : <><Plus className="w-4 h-4"/> إضافة مكتب جديد</>}
          </button>
          
          <button 
            onClick={handleLogout}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4"/> تسجيل الخروج
          </button>
        </div>
      </header>

      {isAdding && (
        <section className="glass-card rounded-3xl p-6 border border-indigo-500/30 bg-indigo-500/5">
          <h2 className="text-lg font-bold text-slate-100 mb-4">إنشاء مكتب / مستفيد جديد</h2>
          <form onSubmit={handleAddTenant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">اسم المكتب / الشركة</label>
              <input required value={newTenantName} onChange={e => setNewTenantName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500/50" placeholder="مثال: مكتب العتيبي للمحاماة" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">اسم مدير المكتب</label>
              <input required value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500/50" placeholder="مثال: سلمان العتيبي" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">البريد الإلكتروني للمدير (لتسجيل الدخول)</label>
              <input type="email" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500/50" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">الرقم السري المبدئي</label>
              <input type="text" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500/50" placeholder="كلمة المرور..." />
            </div>
            <div className="md:col-span-2 mt-2">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-colors cursor-pointer">
                إنشاء المكتب وتفعيل الاشتراك
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="glass-card rounded-3xl p-6">
        <h2 className="mb-4 text-base font-bold text-slate-100">المكاتب المشتركة في النظام</h2>
        <div className="overflow-x-auto subtle-scroll">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="p-3">اسم المكتب</th>
                <th className="p-3">المستخدمين</th>
                <th className="p-3">المشاريع</th>
                <th className="p-3">الاشتراك</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tenants.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-bold text-slate-100">{t.name}</td>
                  <td className="p-3 text-slate-300">{t._count.users}</td>
                  <td className="p-3 text-slate-300">{t._count.matters}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${t.subscriptionStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {t.subscriptionStatus === 'active' ? 'نشط' : 'مغلق'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleStatus(t.id, t.subscriptionStatus)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                      >
                        {t.subscriptionStatus === 'active' ? 'إغلاق الحساب' : 'تفعيل الحساب'}
                      </button>
                      
                      {t.subscriptionStatus === 'active' && (
                        <>
                          <button onClick={() => alert('ميزة تغيير الباقة ستفتح نافذة اختيار باقات الدفع')} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-700/50 hover:bg-indigo-900/30 text-indigo-300 transition-colors cursor-pointer">
                            تغيير الباقة
                          </button>
                          <button onClick={() => alert('تم إرسال طلب إلغاء الاشتراك من بوابة الدفع')} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-700/50 hover:bg-rose-900/30 text-rose-300 transition-colors cursor-pointer">
                            إلغاء الاشتراك
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">لا يوجد مكاتب مشتركة حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Admin Profile Settings Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl w-full max-w-md border-indigo-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-indigo-400" />
                إعدادات حساب النظام
              </h3>
              <button onClick={() => setShowProfile(false)} className="text-slate-400 hover:text-white p-1 bg-slate-900 rounded-full cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المدير</label>
                <input required type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني (تسجيل الدخول)</label>
                <input required type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الرقم السري الجديد (اختياري)</label>
                <input type="password" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500/50" placeholder="اتركه فارغاً إذا لا تريد تغييره..." />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-6">
                <button type="button" onClick={() => setShowProfile(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">إلغاء</button>
                <button type="submit" disabled={isSavingProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer">{isSavingProfile ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
