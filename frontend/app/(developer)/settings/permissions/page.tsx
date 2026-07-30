'use client';

import { useState, useEffect } from 'react';
import { Shield, Loader2, Save, Users, AlertCircle } from 'lucide-react';

const MODULES = [
  { key: 'legal.billing.view', label: 'عرض الفواتير' },
  { key: 'legal.billing.create', label: 'إنشاء الفواتير' },
  { key: 'legal.case.create', label: 'إنشاء القضايا' },
  { key: 'legal.case.delete', label: 'حذف القضايا' },
  { key: 'document.upload', label: 'رفع المستندات' },
  { key: 'document.delete', label: 'حذف المستندات' },
];

export default function PermissionsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/settings/permissions');
      if (res.ok) {
        const data = await res.json();
        // Parse modulePermissions if it's a string
        const parsedData = data.map((u: any) => {
          let perms = [];
          if (typeof u.modulePermissions === 'string') {
            try { perms = JSON.parse(u.modulePermissions); } catch(e) {}
          } else if (Array.isArray(u.modulePermissions)) {
            perms = u.modulePermissions;
          }
          return { ...u, modulePermissions: perms };
        });
        setUsers(parsedData);
      } else {
        alert('لا تملك صلاحية عرض المستخدمين');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (userId: string, moduleKey: string) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const currentPerms = u.modulePermissions || [];
        const newPerms = currentPerms.includes(moduleKey)
          ? currentPerms.filter((k: string) => k !== moduleKey)
          : [...currentPerms, moduleKey];
        return { ...u, modulePermissions: newPerms, isDirty: true };
      }
      return u;
    }));
  };

  const handleSave = async (user: any) => {
    setSavingUserId(user.id);
    try {
      const res = await fetch(`/api/settings/permissions/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulePermissions: user.modulePermissions }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, isDirty: false } : u));
      } else {
        alert('تعذر الحفظ');
      }
    } catch (e) {
      alert('خطأ في الاتصال');
    } finally {
      setSavingUserId(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="space-y-6 font-cairo" dir="rtl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-amber-400" />
          الصلاحيات التفصيلية (Granular Permissions)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          إدارة صلاحيات الوصول الخاصة بكل موظف على مستوى النظام.
        </p>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/50">
                <th className="p-4 pr-6 rounded-tr-xl">المستخدم</th>
                <th className="p-4">الدور الوظيفي</th>
                <th className="p-4">الصلاحيات</th>
                <th className="p-4 pl-6 text-left rounded-tl-xl">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="p-4 pr-6">
                    <div className="font-bold text-slate-200">{user.name}</div>
                    <div className="text-[10px] text-slate-400">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md font-mono text-[10px]">{user.role}</span>
                  </td>
                  <td className="p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {MODULES.map(mod => {
                        const hasPerm = (user.modulePermissions || []).includes(mod.key);
                        const disabled = user.role === 'SUPER_ADMIN' || user.role === 'OWNER';
                        return (
                          <label key={mod.key} className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
                            <input
                              type="checkbox"
                              disabled={disabled}
                              checked={disabled ? true : hasPerm}
                              onChange={() => handleTogglePermission(user.id, mod.key)}
                              className="accent-amber-500 rounded border-slate-700 bg-slate-900"
                            />
                            <span className="text-slate-300">{mod.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    {(user.role === 'SUPER_ADMIN' || user.role === 'OWNER') && (
                      <div className="mt-2 text-[10px] text-amber-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        صلاحيات هذا الدور تمنح الوصول الكامل افتراضياً.
                      </div>
                    )}
                  </td>
                  <td className="p-4 pl-6 text-left">
                    <button
                      onClick={() => handleSave(user)}
                      disabled={!user.isDirty || savingUserId === user.id}
                      className="gold-gradient-bg text-slate-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingUserId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      حفظ التعديلات
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
