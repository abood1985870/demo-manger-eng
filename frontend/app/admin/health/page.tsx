'use client';

import { useState, useEffect } from 'react';
import { Activity, Database, HardDrive, Download, ShieldCheck, CheckCircle2, XCircle, Loader2, Key, Server, RefreshCw } from 'lucide-react';

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/health');
      if (res.ok) {
        setHealthData(await res.json());
      } else {
        const data = await res.json();
        alert(data.error || 'غير مصرح لك باستعراض صحة النظام');
      }
    } catch (e) {
      console.error('Error fetching system health', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`تمت عملية النسخ الاحتياطي بنجاح! الملف: ${data.backup.fileName}`);
        await fetchHealthData();
      } else {
        const data = await res.json();
        alert(`فشلت عملية النسخ الاحتياطي: ${data.error}`);
      }
    } catch (e) {
      alert('حدث خطأ بالاتصال بالنظام');
    } finally {
      setIsBackingUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center font-cairo">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">جاري فحص صحة النظام والخوادم...</p>
      </div>
    );
  }

  const h = healthData || {};

  return (
    <div className="space-y-6 font-cairo text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-amber-400" />
            <span>صحة النظام والنسخ الاحتياطي (System Health & Backup)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">مراقبة سلامة الخوادم، الاتصال بقاعدة البيانات، وحالة النسخ الاحتياطية</p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={isBackingUp}
          className="gold-gradient-bg text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:brightness-110 disabled:opacity-50 cursor-pointer self-start md:self-auto"
        >
          {isBackingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>إنشاء نسخة احتياطية الآن</span>
        </button>
      </div>

      {/* Main Grid Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Database Status Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">قاعدة البيانات (Database)</span>
            <Database className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            {h.databaseConnected ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> متصلة وبحالة ممتازة
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> غير متصلة!
              </span>
            )}
          </div>
        </div>

        {/* Storage Usage Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">حجم التخزين (Storage Usage)</span>
            <HardDrive className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-2xl font-black font-mono text-slate-100">{h.storage?.sizeFormatted || '0 MB'}</p>
          <p className="text-[10px] text-slate-500 truncate">المسار: {h.storage?.path}</p>
        </div>

        {/* Backup Status Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">آخر نسخة احتياطية (Latest Backup)</span>
            <Download className="w-5 h-5 text-teal-400" />
          </div>
          {h.latestBackup ? (
            <div>
              <p className="text-xs font-bold font-mono text-teal-300">{h.latestBackup.fileName}</p>
              <p className="text-[10px] text-slate-400 mt-1">الحجم: {h.latestBackup.sizeFormatted} | التاريخ: {new Date(h.latestBackup.createdAt).toLocaleString('ar-SA')}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">لا توجد نسخ احتياطية مسجلة حتى الآن.</p>
          )}
        </div>
      </div>

      {/* Entity Counts Table */}
      <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Server className="w-4 h-4 text-amber-400" />
          <span>إحصاءات كائنات قاعدة البيانات الإجمالية</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400">إجمالي المشاريع</p>
            <p className="text-xl font-black font-mono text-amber-400 mt-1">{h.entityCounts?.mattersCount || 0}</p>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400">إجمالي العملاء</p>
            <p className="text-xl font-black font-mono text-teal-400 mt-1">{h.entityCounts?.clientsCount || 0}</p>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400">إجمالي المستخدمين</p>
            <p className="text-xl font-black font-mono text-sky-400 mt-1">{h.entityCounts?.usersCount || 0}</p>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400">إجمالي المستندات</p>
            <p className="text-xl font-black font-mono text-purple-400 mt-1">{h.entityCounts?.documentsCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Environment Variables Safe Checks */}
      <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Key className="w-4 h-4 text-amber-400" />
          <span>حالة متغيرات البيئة الأساسية (Safe Env Var Status)</span>
        </h3>
        <p className="text-xs text-slate-400">تأكيد وجود متغيرات البيئة دون إظهار أي مفاتيح أو قيم سرية لأغراض الأمان:</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">DATABASE_URL</span>
            {h.envStatus?.DATABASE_URL?.isSet ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">موجودة</span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">مفقودة!</span>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">JWT_SECRET</span>
            {h.envStatus?.JWT_SECRET?.isSet ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">موجودة</span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">مفقودة!</span>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">DOCUMENT_STORAGE_PATH</span>
            {h.envStatus?.DOCUMENT_STORAGE_PATH?.isSet ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">موجودة</span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">افتراضية (uploads)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
