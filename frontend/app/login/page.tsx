'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Activity,
  Globe
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('tenantId');
    sessionStorage.removeItem('userName');
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, ...(mfaRequired ? { mfaCode } : {}) }),
      });
      const data = await response.json();
      if (data.mfaRequired) {
        setMfaRequired(true);
        return;
      }
      if (!response.ok || !data.success) {
        setError(data.error || 'بيانات الدخول غير صحيحة');
        if (mfaRequired) setMfaCode('');
        return;
      }

      sessionStorage.setItem('userRole', data.user.role);
      sessionStorage.setItem('userId', data.user.id);
      sessionStorage.setItem('tenantId', data.user.tenantId);
      sessionStorage.setItem('userName', data.user.name);
      
      const role = (data.user.role || '').toLowerCase();
      const destination = data.mustChangePassword
        ? '/change-password'
        : role === 'superadmin'
          ? '/admin'
          : ['admin', 'owner'].includes(role)
            ? '/dashboard'
            : ['lawyer', 'developer', 'project_manager'].includes(role)
              ? '/dashboard'
              : '/portal';
      window.location.assign(destination);
    } catch {
      setError('تعذر الاتصال بالنظام. تحقق من تشغيل الخادم ثم حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-slate-950 font-cairo text-white overflow-hidden selection:bg-amber-500/30" dir="rtl">
      {/* Visual Section - The Premium Feel */}
      <section className="hidden md:flex flex-1 relative bg-slate-900 overflow-hidden flex-col justify-between p-12">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        
        {/* Floating Glass Cards */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
           <div className="absolute top-[20%] right-[15%] w-64 h-32 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl transform rotate-12 flex items-center justify-center shadow-2xl animate-in slide-in-from-right-1/4 fade-in duration-1000">
             <div className="text-center">
               <p className="text-amber-400 font-bold text-lg">150M+ SAR</p>
               <p className="text-xs text-slate-400">Escrow Liquidity</p>
             </div>
           </div>
           <div className="absolute top-[50%] left-[10%] w-72 h-40 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl transform -rotate-6 flex flex-col p-6 shadow-2xl animate-in slide-in-from-left-1/4 fade-in duration-1000 delay-300">
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">WAFI SYNC</span>
                <Activity className="w-4 h-4 text-emerald-400" />
             </div>
             <p className="text-sm font-bold text-slate-300 mb-2">Construction Progress</p>
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[78%]"></div>
             </div>
           </div>
        </div>

        {/* Content */}
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Link href="/landing" className="flex items-center gap-2 group w-fit">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-black text-xl leading-none">رُسوخ</span>
              <span className="block text-[10px] text-amber-500 font-bold tracking-widest mt-0.5">منصة المطورين</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <h1 className="text-5xl font-black mb-6 leading-tight">
            المنصة التي تدير<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 to-amber-500">
              مليارات الريالات
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-8">
            بوابة تنفيذية واحدة للسيطرة المطلقة على المبيعات، ومزامنة تقارير وافي الهندسية، وتدفقات حسابات الضمان.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="w-4 h-4" /></div>
              <span>مزامنة تلقائية مع حسابات الضمان البنكية</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400"><Globe className="w-4 h-4" /></div>
              <span>بوابات مخصصة للمستثمرين (Client Portals)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="p-1.5 rounded-full bg-purple-500/20 text-purple-400"><ShieldCheck className="w-4 h-4" /></div>
              <span>أعلى معايير الأمان وتشفير البيانات المالية</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="flex-1 flex items-center justify-center p-8 bg-slate-950 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 opacity-50 pointer-events-none"></div>
        
        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Logo */}
          <Link href="/landing" className="flex items-center gap-2 mb-12 md:hidden">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-black text-xl">رُسوخ</span>
          </Link>

          <div className="mb-10 text-center md:text-right animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-3xl font-black text-white mb-2">{mfaRequired ? 'التحقق من الهوية' : 'مرحباً بعودتك'}</h2>
            <p className="text-slate-400">{mfaRequired ? 'أدخل الرمز المؤقت لإكمال الدخول الآمن لحسابك.' : 'سجّل الدخول للوصول إلى لوحة القيادة التنفيذية.'}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm font-bold animate-in zoom-in-95">
                <LockKeyhole className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {!mfaRequired ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 block">البريد الإلكتروني</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="name@developer.sa" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pr-12 pl-4 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 block">كلمة المرور</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••••••" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pr-12 pl-12 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner tracking-widest"
                      dir="ltr"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 block text-center">رمز التحقق المكوّن من 6 أرقام</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 text-center text-3xl tracking-[1em] text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  autoFocus
                  dir="ltr"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] disabled:opacity-70 disabled:cursor-not-allowed group mt-8"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>{mfaRequired ? 'تأكيد الهوية والدخول' : 'تسجيل الدخول'}</span>
              {!isSubmitting && <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />}
            </button>

            {mfaRequired && (
              <button 
                type="button" 
                onClick={() => { setMfaRequired(false); setMfaCode(''); }}
                className="w-full text-center text-sm text-slate-500 hover:text-white transition-colors"
              >
                العودة وإدخال كلمة المرور مجدداً
              </button>
            )}
            
          </form>

          <p className="text-center text-xs text-slate-600 mt-12 animate-in fade-in duration-1000 delay-500">
            أعلى معايير التشفير وأمن المعلومات مطبقة في منصة رُسوخ © {new Date().getFullYear()}
          </p>
        </div>
      </section>
    </main>
  );
}
