'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square,
  Clock,
  Briefcase,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  FileText,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function LawyerWorkspace() {
  // Timer State
  const [isTiming, setIsTiming] = useState(false);
  const [time, setTime] = useState(0);
  const [activeMatterId, setActiveMatterId] = useState<string | null>(null);

  // Database State
  const [matters, setMatters] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [hearings, setHearings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/lawyer/matters');
        if (response.ok) {
          const data = await response.json();
          setMatters(data);
          
          // Flatten tasks and hearings from matters
          const allTasks = data.flatMap((m: any) => m.tasks);
          const allHearings = data.flatMap((m: any) => m.hearings);
          
          setTasks(allTasks);
          setHearings(allHearings);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTiming) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTiming]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStopTimer = () => {
    setIsTiming(false);
    setTime(0);
  };

  const toggleTask = async (taskId: string) => {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t));
    
    // API Call
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
        await fetch('/api/lawyer/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id, isDone: !task.isDone }),
        });
      } catch (error) {
        console.error('Failed to update task');
        // Revert on error
        setTasks(tasks.map(t => t.id === taskId ? { ...t, isDone: task.isDone } : t));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a]">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="project-manager-workspace" className="rusukh-dark-surface min-h-screen w-full bg-[#0f172a] p-4 text-slate-100 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">مساحة عمل مدير المشروع</h1>
          <p className="text-slate-300 mt-2">مرحباً بك، لديك {tasks.filter(t => !t.isDone).length} مهام مفتوحة و {hearings.length} مواعيد قادمة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timer & Tasks */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* Billable Hours Timer */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                متتبع الساعات
              </h2>
              <div className="text-3xl font-mono font-bold text-amber-400 tabular-nums">
                {formatTime(time)}
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <select 
                className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-slate-300 focus:border-amber-500/50 outline-none transition-colors"
                value={activeMatterId || ''}
                onChange={(e) => setActiveMatterId(e.target.value)}
              >
                <option value="">-- اختر المشروع للعمل عليها --</option>
                {matters.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>

              <div className="flex gap-2">
                {!isTiming ? (
                  <button 
                    onClick={() => setIsTiming(true)}
                    disabled={!activeMatterId}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 fill-current" /> بدء الوقت
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsTiming(false)}
                    className="flex-1 bg-amber-500/20 text-amber-500 border border-amber-500/50 hover:bg-amber-500/30 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Pause className="w-4 h-4 fill-current" /> إيقاف مؤقت
                  </button>
                )}
                
                <button 
                  onClick={handleStopTimer}
                  disabled={time === 0}
                  className="bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 font-bold p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="إنهاء وحفظ"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>

          {/* Daily Tasks */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/60 bg-slate-900/50">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              مهام اليوم
            </h2>
            <div className="space-y-3">
              {tasks.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">لا توجد مهام حالياً</p>
              )}
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    task.isDone 
                      ? 'bg-slate-900/30 border-slate-800/30 opacity-50' 
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'
                  }`}
                  onClick={() => toggleTask(task.id)}
                >
                  <button className="mt-0.5 shrink-0">
                    {task.isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-amber-500 transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${task.isDone ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      مشروع: {matters.find(m => m.id === task.matterId)?.title || 'عام'}
                    </p>
                  </div>
                  {task.isUrgent && !task.isDone && (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Docket & Matters */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* Docket Calendar */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/60 bg-slate-900/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                أجندة المواعيد (Docket)
              </h2>
              <button className="text-xs font-bold text-amber-500 hover:text-amber-400">عرض التقويم كاملاً</button>
            </div>
            
            <div className="relative">
              <div className="absolute top-0 bottom-0 right-[27px] w-px bg-slate-800"></div>
              <div className="space-y-6">
                {hearings.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">لا توجد مواعيد قادمة</p>
                )}
                {hearings.map((hearing, i) => {
                  const d = new Date(hearing.date);
                  return (
                    <div key={hearing.id} className="relative flex gap-6 z-10">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-14 text-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            {d.toLocaleDateString('ar-SA', { month: 'short' })}
                          </span>
                          <span className="text-xl font-black text-amber-500">{d.getDate()}</span>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-amber-500 mt-2 ring-4 ring-[#0f172a]"></div>
                      </div>
                      <div className="flex-1 bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl hover:bg-slate-800/60 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-200">
                            {matters.find(m => m.id === hearing.matterId)?.title}
                          </h3>
                          <span className="px-2 py-1 bg-slate-950 text-slate-300 text-[10px] font-bold rounded-md border border-slate-800">
                            {hearing.court}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{hearing.summary}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Matters */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/60 bg-slate-900/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                المشاريع النشطة
              </h2>
              <Link href="/matters" className="text-xs font-bold text-amber-500 hover:text-amber-400">إدارة المشاريع</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matters.length === 0 && (
                <p className="text-sm text-slate-500 col-span-2 text-center py-4">لا توجد مشاريع نشطة</p>
              )}
              {matters.map((matter) => (
                <div key={matter.id} className="group bg-slate-950/50 border border-slate-800 p-5 rounded-xl hover:border-amber-500/30 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                        {matter.caseNumber || 'بدون رقم'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <h3 className="font-bold text-slate-200 mb-1 line-clamp-1">{matter.title}</h3>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{matter.tasks?.length || 0} مهام</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
