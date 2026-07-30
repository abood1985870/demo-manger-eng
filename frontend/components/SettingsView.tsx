'use client';

import React, { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun, KeyRound, Shield, AlertCircle, CheckCircle2, UserCircle, Upload, Trash2, Loader2 } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';

export function SettingsView({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const { theme, setTheme } = useTheme();
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Profile and Avatar state
  const [profile, setProfile] = useState<any>(null);
  const [avatarStatus, setAvatarStatus] = useState<'idle' | 'uploading' | 'error' | 'success'>('idle');
  const [avatarMessage, setAvatarMessage] = useState('');

  React.useEffect(() => {
    fetch('/api/auth/profile')
      .then(res => res.json())
      .then(data => { if (!data.error) setProfile(data); })
      .catch(console.error);
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setAvatarStatus('error');
      setAvatarMessage('يجب أن لا يتجاوز حجم الصورة 5 ميجابايت.');
      return;
    }

    setAvatarStatus('uploading');
    setAvatarMessage('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/auth/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAvatarStatus('success');
        setAvatarMessage('تم رفع الصورة بنجاح.');
        setProfile((prev: any) => ({ ...prev, avatarUrl: data.avatarUrl }));
        setTimeout(() => setAvatarStatus('idle'), 3000);
      } else {
        setAvatarStatus('error');
        setAvatarMessage(data.error || 'فشل رفع الصورة.');
      }
    } catch (err) {
      setAvatarStatus('error');
      setAvatarMessage('حدث خطأ أثناء الاتصال بالخادم.');
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('هل أنت متأكد من حذف الصورة الشخصية؟')) return;
    
    setAvatarStatus('uploading');
    try {
      const res = await fetch('/api/auth/profile/avatar', { method: 'DELETE' });
      if (res.ok) {
        setAvatarStatus('success');
        setAvatarMessage('تم حذف الصورة بنجاح.');
        setProfile((prev: any) => ({ ...prev, avatarUrl: null }));
        setTimeout(() => setAvatarStatus('idle'), 3000);
      } else {
        const data = await res.json();
        setAvatarStatus('error');
        setAvatarMessage(data.error || 'فشل حذف الصورة.');
      }
    } catch (err) {
      setAvatarStatus('error');
      setAvatarMessage('حدث خطأ أثناء الاتصال بالخادم.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordMessage('كلمة المرور الجديدة غير متطابقة.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus('error');
      setPasswordMessage('كلمة المرور يجب أن لا تقل عن 8 أحرف.');
      return;
    }

    setPasswordStatus('loading');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordStatus('success');
        setPasswordMessage('تم تغيير كلمة المرور بنجاح.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus('error');
        setPasswordMessage(data.error || 'فشل تغيير كلمة المرور.');
      }
    } catch (err) {
      setPasswordStatus('error');
      setPasswordMessage('حدث خطأ أثناء الاتصال بالخادم.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">الإعدادات العامة</h1>
        <p className="text-slate-400 mt-2">قم بضبط تفضيلاتك الشخصية وإدارة حسابك.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Avatar Section */}
        <section className="glass-card p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60 shadow-lg md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <UserCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-200">الصورة الشخصية</h2>
              <p className="text-sm text-slate-400">يمكنك إضافة صورة شخصية اختيارية بصيغة JPG أو PNG أو WEBP، وبحجم لا يتجاوز 5 ميجابايت.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/50 p-6 rounded-xl border border-slate-800">
            <UserAvatar user={profile} className="w-24 h-24 ring-4 ring-slate-800 text-3xl" />
            
            <div className="flex flex-col items-center sm:items-start gap-3 w-full sm:w-auto">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full">
                <label className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${avatarStatus === 'uploading' ? 'opacity-50 pointer-events-none bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-900 hover:bg-white'}`}>
                  {avatarStatus === 'uploading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{profile?.avatarUrl ? 'تغيير الصورة' : 'رفع صورة'}</span>
                  <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleAvatarUpload} disabled={avatarStatus === 'uploading'} />
                </label>
                {profile?.avatarUrl && (
                  <button onClick={handleDeleteAvatar} disabled={avatarStatus === 'uploading'} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all disabled:opacity-50">
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الصورة</span>
                  </button>
                )}
              </div>
              
              {avatarStatus === 'error' && <p className="text-xs font-bold text-rose-400">{avatarMessage}</p>}
              {avatarStatus === 'success' && <p className="text-xs font-bold text-emerald-400">{avatarMessage}</p>}
            </div>
          </div>
        </section>
        
        {/* Appearance Section */}
        <section className="glass-card p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Sun className="w-5 h-5 dark:hidden" />
              <Moon className="w-5 h-5 hidden dark:block" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-200">المظهر العام</h2>
              <p className="text-sm text-slate-400">اختر الوضع المناسب لشاشتك.</p>
            </div>
          </div>
          
          <div className="flex bg-slate-950/50 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${theme === 'light' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Sun className="w-4 h-4" /> الوضع الفاتح
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${theme === 'dark' ? 'bg-slate-800 text-amber-400 shadow-sm border border-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Moon className="w-4 h-4" /> الوضع الداكن
            </button>
          </div>
        </section>

        {/* Password Section */}
        <section className="glass-card p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60 shadow-lg md:row-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-200">الأمان وكلمة المرور</h2>
              <p className="text-sm text-slate-400">حافظ على أمان حسابك.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1.5">كلمة المرور الحالية</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1.5">كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                placeholder="8 أحرف على الأقل"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1.5">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                placeholder="أعد إدخال كلمة المرور"
              />
            </div>

            {passwordStatus === 'error' && (
              <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{passwordMessage}</p>
              </div>
            )}
            
            {passwordStatus === 'success' && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-lg text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>{passwordMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordStatus === 'loading'}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {passwordStatus === 'loading' ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
            </button>
          </form>
        </section>

        {/* Help & Support Section */}
        <section className="glass-card p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-200">الدعم والمساعدة</h2>
              <p className="text-sm text-slate-400">المعلومات والدعم الفني</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              <strong>نسخة النظام:</strong> v1.0.0 (Enterprise)
            </p>
            <p>
              هذا النظام مخصص لإدارة أعمال التطوير العقاري داخلياً ضمن بيئة الشركة الخاصة.
              {isSuperAdmin && (
                <span className="text-amber-400 block mt-2 p-2 bg-amber-500/10 rounded-lg">
                  أنت مسجل الدخول بصفة مدير النظام (Super Admin). يمكنك إدارة الاشتراكات والمكاتب من لوحة التحكم الرئيسية.
                </span>
              )}
            </p>
            <div className="pt-2">
              <p className="text-slate-500">للدعم الفني والتواصل مع فريق التطوير، يرجى مراجعة مدير النظام.</p>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}
