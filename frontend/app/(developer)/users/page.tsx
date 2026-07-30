'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Users, ShieldCheck, Mail, Lock, CheckCircle2, User, Key, Building2, Sliders, ShieldAlert, Edit2, X, Check, Eye, EyeOff, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import {
  DEFAULT_TEAM_MEMBER_PERMISSIONS,
  MODULE_PERMISSION_OPTIONS,
  ModulePermissionKey,
  parseModulePermissions,
} from '@/lib/module-permissions';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetTarget, setResetTarget] = useState<any | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [resetError, setResetError] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [permissionsTarget, setPermissionsTarget] = useState<any | null>(null);
  const [savingModule, setSavingModule] = useState<ModulePermissionKey | null>(null);

  // Avatar Edit State
  const [avatarTarget, setAvatarTarget] = useState<any | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploadStatus, setAvatarUploadStatus] = useState<'idle'|'uploading'|'error'>('idle');
  const [avatarError, setAvatarError] = useState('');

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'lawyer',
    modulePermissions: { ...DEFAULT_TEAM_MEMBER_PERMISSIONS },
  });

  useEffect(() => {
    setCurrentRole(sessionStorage.getItem('userRole') || '');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          modulePermissions: newUser.modulePermissions,
        })
      });

      if (res.ok) {
        await fetchUsers(); // Refresh the list
        setShowCreateModal(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'lawyer',
          modulePermissions: { ...DEFAULT_TEAM_MEMBER_PERMISSIONS },
        });
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to add user', error);
      alert('حدث خطأ في النظام');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetTarget) return;
    setResetError('');
    if (temporaryPassword.length < 12) return setResetError('يجب أن تتكون كلمة المرور المؤقتة من 12 حرفًا على الأقل.');
    if (temporaryPassword !== passwordConfirmation) return setResetError('تأكيد كلمة المرور غير مطابق.');
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${resetTarget.id}/password-reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ temporaryPassword }) });
      const data = await response.json();
      if (!response.ok) return setResetError(data.error || 'تعذر إعادة تعيين كلمة المرور.');
      setResetTarget(null); setTemporaryPassword(''); setPasswordConfirmation('');
      alert('تم تعيين كلمة مرور مؤقتة. سيُطلب من المستخدم تغييرها عند تسجيل الدخول.');
    } catch { setResetError('تعذر الاتصال بالنظام.'); }
    finally { setIsSubmitting(false); }
  };

  const updateCreateCasePermission = async (user: any, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/permissions`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permission: 'CREATE_CASE', enabled }) });
      if (!response.ok) throw new Error((await response.json()).error || 'تعذر تحديث الصلاحية.');
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, canCreateCase: enabled } : item));
    } catch (error) { alert(error instanceof Error ? error.message : 'تعذر تحديث الصلاحية.'); }
  };

  const updateModulePermission = async (user: any, module: ModulePermissionKey, enabled: boolean) => {
    setSavingModule(module);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission: 'MODULE_ACCESS', module, enabled }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'تعذر تحديث صلاحية القسم.');
      const updatedUser = { ...user, modulePermissions: data.modulePermissions };
      setPermissionsTarget(updatedUser);
      setUsers((current) => current.map((item) => item.id === user.id ? updatedUser : item));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'تعذر تحديث صلاحية القسم.');
    } finally {
      setSavingModule(null);
    }
  };

  const handleAvatarUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarTarget || !avatarFile) return;

    if (avatarFile.size > 5 * 1024 * 1024) {
      setAvatarError('يجب أن لا يتجاوز حجم الصورة 5 ميجابايت.');
      return;
    }

    setAvatarUploadStatus('uploading');
    setAvatarError('');
    const formData = new FormData();
    formData.append('file', avatarFile);

    try {
      const res = await fetch(`/api/admin/users/${avatarTarget.id}/avatar`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await fetchUsers();
        setAvatarTarget(null);
        setAvatarFile(null);
      } else {
        const data = await res.json();
        setAvatarError(data.error || 'تعذر رفع الصورة');
      }
    } catch (err) {
      setAvatarError('تعذر الاتصال بالنظام');
    } finally {
      setAvatarUploadStatus('idle');
    }
  };

  const handleDeleteAvatar = async () => {
    if (!avatarTarget) return;
    setAvatarUploadStatus('uploading');
    try {
      const res = await fetch(`/api/admin/users/${avatarTarget.id}/avatar`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUsers();
        setAvatarTarget(null);
      } else {
        setAvatarError('تعذر حذف الصورة');
      }
    } catch (err) {
      setAvatarError('تعذر الاتصال بالنظام');
    } finally {
      setAvatarUploadStatus('idle');
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
            <Users className="w-6 h-6 text-amber-400" />
            <span>إدارة الموظفين والصلاحيات بالشركة</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إضافة مدير مشروعن جدد وإدارة صلاحيات النظام (مربوط بقاعدة البيانات)
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="gold-gradient-bg text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مدير مشروع / مدير جديد</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-bold text-base text-slate-100 mb-4">قائمة المستخدمين في الشركة</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/50">
                <th className="p-4 pr-6">الموظف / مدير المشروع</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">الدور الوظيفي (Role)</th>
                <th className="p-4">تاريخ الانضمام</th>
                <th className="p-4">الإجراءات</th>
                <th className="p-4">CREATE_CASE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} className="w-10 h-10 ring-2 ring-amber-500/30" />
                      <div>
                        <p className="font-bold text-slate-100 text-sm">{u.name}</p>
                        {u.id === sessionStorage.getItem('userId') && (
                          <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md mt-1 inline-block">أنت</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-300">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.role === 'admin' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {u.role === 'admin' ? 'مدير (Admin)' : 'مدير مشروع (Lawyer)'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      {((currentRole.toLowerCase() === 'superadmin' && ['admin', 'owner'].includes(u.role.toLowerCase())) || (['admin', 'owner'].includes(currentRole.toLowerCase()) && u.role.toLowerCase() === 'lawyer')) && (
                        <button onClick={() => { setResetTarget(u); setResetError(''); }} className="rounded-lg border border-amber-500/30 px-3 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/10 text-right w-full">إعادة تعيين المرور</button>
                      )}
                      {((currentRole.toLowerCase() === 'superadmin' && u.role.toLowerCase() !== 'superadmin') || (['admin', 'owner'].includes(currentRole.toLowerCase()) && u.role.toLowerCase() !== 'superadmin')) && (
                        <button onClick={() => { setAvatarTarget(u); setAvatarError(''); setAvatarFile(null); }} className="rounded-lg border border-blue-500/30 px-3 py-1.5 text-[11px] font-bold text-blue-300 hover:bg-blue-500/10 flex items-center gap-2 justify-center w-full"><ImageIcon className="w-3.5 h-3.5" /> تعديل الصورة</button>
                      )}
                      {u.role.toLowerCase() === 'lawyer' && (
                        <button
                          data-testid={`manage-module-permissions-${u.email}`}
                          onClick={() => setPermissionsTarget(u)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          تخصيص الوصول للأقسام
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-4">{u.role.toLowerCase() === 'lawyer' ? <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300"><input aria-label={`CREATE_CASE ${u.email}`} type="checkbox" checked={Boolean(u.canCreateCase)} onChange={(event) => void updateCreateCasePermission(u, event.target.checked)} className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500" />إضافة مشروع</label> : <span className="text-xs text-emerald-400">افتراضي</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-h-[calc(100vh-2rem)] w-full max-w-2xl space-y-6 overflow-y-auto rounded-3xl border-amber-500/30 p-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>إضافة مستخدم جديد</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. عبد العزيز بن فهد"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني المهني (تسجيل الدخول)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@firm.sa"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور المؤقتة</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الدور الوظيفي والصلاحيات</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="lawyer">مدير مشروع (Lawyer)</option>
                  <option value="admin">مدير النظام (Admin)</option>
                </select>
              </div>

              {newUser.role === 'lawyer' ? (
                <fieldset className="space-y-3 rounded-2xl border border-slate-700 bg-slate-950/40 p-4">
                  <legend className="px-2 text-xs font-bold text-amber-300">صلاحيات الأقسام عند إنشاء المهندس</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {MODULE_PERMISSION_OPTIONS.map((option) => (
                      <label key={option.key} className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-800 p-3 hover:border-amber-500/30">
                        <input
                          type="checkbox"
                          checked={newUser.modulePermissions[option.key]}
                          onChange={(event) => setNewUser((current) => ({
                            ...current,
                            modulePermissions: { ...current.modulePermissions, [option.key]: event.target.checked },
                          }))}
                          className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-500"
                        />
                        <span>
                          <b className="block text-xs text-slate-100">{option.label}</b>
                          <small className="text-[10px] leading-5 text-slate-400">{option.description}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}

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
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإنشاء الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"><form onSubmit={handlePasswordReset} className="glass-card w-full max-w-md space-y-5 rounded-3xl border border-amber-500/30 p-6"><div><h3 className="text-lg font-bold text-slate-100">إعادة تعيين كلمة المرور</h3><p className="mt-2 text-sm text-slate-400">{resetTarget.name} سيُطلب منه تغيير كلمة المرور المؤقتة عند الدخول.</p></div>{resetError && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">{resetError}</p>}<input aria-label="كلمة المرور المؤقتة" type="password" required value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} placeholder="كلمة مرور مؤقتة، 12 حرفًا على الأقل" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100" /><input aria-label="تأكيد كلمة المرور المؤقتة" type="password" required value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="تأكيد كلمة المرور المؤقتة" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100" /><div className="flex justify-end gap-3"><button type="button" onClick={() => setResetTarget(null)} className="px-4 py-2 text-sm text-slate-400">إلغاء</button><button disabled={isSubmitting} className="gold-gradient-bg rounded-xl px-4 py-2 text-sm font-extrabold text-slate-950 disabled:opacity-50">تعيين كلمة مؤقتة</button></div></form></div>}

      {permissionsTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div data-testid="module-permissions-modal" className="rusukh-permissions-modal max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl p-6">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  صلاحيات الوصول للأقسام
                </h3>
                <p className="mt-1 text-xs text-slate-400">{permissionsTarget.name} · {permissionsTarget.email}</p>
              </div>
              <button type="button" aria-label="إغلاق صلاحيات الأقسام" onClick={() => setPermissionsTarget(null)} className="rounded-full border border-slate-700 p-2 text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {MODULE_PERMISSION_OPTIONS.map((option) => {
                const permissions = parseModulePermissions(permissionsTarget.modulePermissions, permissionsTarget.role);
                const enabled = permissions[option.key];
                return (
                  <label key={option.key} className={`rusukh-permission-option flex cursor-pointer items-start justify-between gap-3 rounded-2xl border p-4 transition-colors ${enabled ? 'is-enabled' : ''}`}>
                    <span>
                      <b className="block text-sm text-slate-100">{option.label}</b>
                      <small className="mt-1 block text-[11px] leading-5 text-slate-400">{option.description}</small>
                    </span>
                    <input
                      aria-label={`${option.label} ${permissionsTarget.email}`}
                      type="checkbox"
                      checked={enabled}
                      disabled={savingModule !== null}
                      onChange={(event) => void updateModulePermission(permissionsTarget, option.key, event.target.checked)}
                      className="mt-1 h-5 w-5 shrink-0 rounded border-slate-600 bg-slate-900 text-emerald-500 disabled:opacity-50"
                    />
                  </label>
                );
              })}
            </div>
            <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-xs leading-6 text-amber-200">
              تُطبّق التغييرات فوراً. إذا كان الموظف مسجلاً دخوله فسيُطلب منه تسجيل الدخول من جديد لحماية البيانات.
            </p>
          </div>
        </div>
      ) : null}
      
      {/* AVATAR MODAL */}
      {avatarTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form onSubmit={handleAvatarUpdate} className="glass-card w-full max-w-sm space-y-5 rounded-3xl border border-blue-500/30 p-6 text-center">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 justify-center"><ImageIcon className="w-5 h-5 text-blue-400"/> صورة {avatarTarget.name}</h3>
            
            <div className="flex justify-center my-4">
              <UserAvatar user={avatarTarget} className="w-24 h-24 ring-4 ring-slate-800 text-3xl" />
            </div>

            {avatarError && <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg">{avatarError}</p>}
            
            <input type="file" accept="image/jpeg, image/png, image/webp" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 bg-slate-900 p-2 rounded-xl" />
            
            <div className="flex justify-center gap-2 pt-2">
              <button type="button" onClick={() => setAvatarTarget(null)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200">إلغاء</button>
              {avatarTarget.avatarUrl && (
                <button type="button" onClick={handleDeleteAvatar} disabled={avatarUploadStatus === 'uploading'} className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50">حذف الصورة</button>
              )}
              <button type="submit" disabled={!avatarFile || avatarUploadStatus === 'uploading'} className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50">
                {avatarUploadStatus === 'uploading' ? 'جاري الرفع...' : 'رفع الصورة'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
