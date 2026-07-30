'use client';

import { useCallback, useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, Loader2, User, Clock, Monitor, Activity, CheckCircle2 } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = actionFilter !== 'all' ? `/api/admin/audit-logs?action=${actionFilter}` : '/api/admin/audit-logs';
      const res = await fetch(url);
      if (res.ok) {
        setLogs(await res.json());
      } else {
        const data = await res.json();
        alert(data.error || 'غير مصرح لك برؤية سجلات التدقيق');
      }
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.user?.name || '').includes(searchTerm) ||
      (log.user?.email || '').includes(searchTerm) ||
      log.action.includes(searchTerm) ||
      log.entityType.includes(searchTerm) ||
      (log.metadata || '').includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-cairo text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>سجل التدقيق والرقابة (Audit Log)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">تسجيل وتتبع جميع العمليات والتغييرات الحساسة بالنظام</p>
        </div>

        <div className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 self-start md:self-auto">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>مراقبة حية ونشطة</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث بالمستخدم، الإجراء، أو نوع الكيان..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pr-10 pl-4 text-xs text-slate-100 outline-none focus:border-amber-500/50"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
        >
          <option value="all">جميع الإجراءات والعمليات</option>
          <option value="AUTH_LOGIN">تسجيل الدخول (AUTH_LOGIN)</option>
          <option value="MATTER_CREATE">إنشاء مشروع (MATTER_CREATE)</option>
          <option value="TASK_CREATE">إنشاء مهمة (TASK_CREATE)</option>
          <option value="TASK_UPDATE">تحديث مهمة (TASK_UPDATE)</option>
          <option value="HEARING_CREATE">إضافة موعد/جلسة (HEARING_CREATE)</option>
          <option value="TEMPLATE_CREATE">إنشاء قالب (TEMPLATE_CREATE)</option>
          <option value="DOCUMENT_GENERATE">توليد وثيقة (DOCUMENT_GENERATE)</option>
        </select>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" /></div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-card rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300">لا توجد سجلات تدقيق مطابقة</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto subtle-scroll">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">الوقت والتاريخ</th>
                  <th className="p-3.5">المستخدم</th>
                  <th className="p-3.5">نوع الإجراء (Action)</th>
                  <th className="p-3.5">الكيان المتأثر</th>
                  <th className="p-3.5">تفاصيل وميتا (Metadata)</th>
                  <th className="p-3.5">IP / الجهاز</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString('ar-SA')}
                    </td>
                    <td className="p-3.5 font-bold text-slate-200">
                      {log.user ? (
                        <div>
                          <p>{log.user.name}</p>
                          <p className="text-[10px] text-slate-500 font-normal">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500">النظام</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {log.entityType} ({log.entityId?.substring(0, 8) || '-'})
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-[11px] font-mono text-slate-400">
                      {log.metadata || '-'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
