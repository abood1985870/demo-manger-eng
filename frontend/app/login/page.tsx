'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      sessionStorage.setItem(
        'canCreateCase',
        String(data.user.canCreateCase || ['admin', 'owner', 'superadmin'].includes((data.user.role || '').toLowerCase())),
      );

      const role = (data.user.role || '').toLowerCase();
      const destination = data.mustChangePassword
        ? '/change-password'
        : role === 'superadmin'
          ? '/admin'
          : ['admin', 'owner'].includes(role)
            ? '/dashboard'
            : ['lawyer', 'developer', 'project_manager'].includes(role)
              ? '/my-cases'
              : '/portal';
      window.location.assign(destination);
    } catch {
      setError('تعذر الاتصال بالنظام. تحقق من تشغيل الخادم ثم حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="rusukh-login" dir="rtl">
      <section className="rusukh-login-story">
        <Link href="/landing" className="rusukh-login-brand">
          <span><Building2 /></span>
          <span><b>رُسوخ</b><small>قيادة التطوير العقاري</small></span>
        </Link>
        <div>
          <h1>كل مشروع تحت السيطرة، من الأرض إلى التسليم.</h1>
          <p>نظرة تنفيذية واحدة تجمع البرنامج الزمني والتكلفة والمبيعات والامتثال، وتحوّل بيانات المشروع إلى قرار واضح.</p>
          <ul>
            <li><CheckCircle2 /> مؤشرات SPI وCPI من بيانات القيمة المكتسبة</li>
            <li><CheckCircle2 /> متابعة تراخيص البيع على الخارطة والبناء والإشغال</li>
            <li><CheckCircle2 /> صلاحيات دقيقة وسجل تدقيق ونسخ احتياطي</li>
          </ul>
        </div>
        <footer><ShieldCheck /> بيانات شركتك تبقى داخل بيئة التشغيل الخاصة بك.</footer>
      </section>

      <section className="rusukh-login-form-wrap">
        <form onSubmit={handleLogin} className="rusukh-login-form">
          <Image
            src="/brand/rusukh-logo.png"
            alt="رُسوخ — قيادة التطوير العقاري"
            width={716}
            height={492}
            priority
            className="rusukh-login-logo"
          />
          <header>
            <h2>{mfaRequired ? 'التحقق من الهوية' : 'مرحباً بعودتك'}</h2>
            <p>{mfaRequired ? 'أدخل الرمز المؤقت لإكمال الدخول الآمن.' : 'سجّل الدخول إلى مساحة عمل شركة التطوير.'}</p>
          </header>

          {error ? <div className="rusukh-login-error" role="alert"><LockKeyhole /> {error}</div> : null}

          {!mfaRequired ? (
            <>
              <label>
                البريد الإلكتروني
                <span><Mail /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.sa" /></span>
              </label>
              <label>
                كلمة المرور
                <span>
                  <KeyRound />
                  <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="أدخل كلمة المرور" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </span>
              </label>
            </>
          ) : (
            <label className="rusukh-mfa-label">
              رمز التحقق المكوّن من 6 أرقام
              <input
                aria-label="رمز التحقق"
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </label>
          )}

          <button type="submit" disabled={isSubmitting} className="rusukh-login-submit">
            {isSubmitting ? <Loader2 className="animate-spin" /> : null}
            {mfaRequired ? 'تأكيد الدخول' : 'الدخول إلى رُسوخ'}
            <ArrowLeft />
          </button>

          {mfaRequired ? (
            <button type="button" className="rusukh-login-back" onClick={() => { setMfaRequired(false); setMfaCode(''); }}>
              العودة إلى بيانات الدخول
            </button>
          ) : null}
          <p className="rusukh-login-help">تحتاج مساعدة؟ تواصل مع مدير النظام في شركتك.</p>
        </form>
      </section>
    </main>
  );
}
