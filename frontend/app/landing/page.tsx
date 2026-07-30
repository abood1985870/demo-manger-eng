'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Briefcase, 
  Scale, 
  Receipt, 
  FileText, 
  BookOpen, 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  Star,
  Building2,
  Lock,
  ChevronDown,
  Sparkles,
  Zap,
  PhoneCall,
  X,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';

import { ThemeToggle } from '@/components/ThemeToggle';

const plans = [
  {
    id: 'basic',
    name: 'باقة المكاتب الناشئة (Basic)',
    price: '2,900 ر.س',
    period: '/ شهرياً',
    desc: 'مثالية للمكاتب الفردية والمطورن المستقلين',
    features: ['حتى 5 مطورن وموظفين', 'إدارة المشاريع والمهام الميدانية', 'الفوترة الإلكترونية ZATCA المرحلة الأولى والثانية', 'مساحة تخزين سحابية 50 GB', 'دعم فني عبر البريد والواتساب'],
    popular: false,
    badge: 'للمستقلين'
  },
  {
    id: 'pro',
    name: 'باقة المكاتب المتوسطة (Pro)',
    price: '8,500 ر.س',
    period: '/ شهرياً',
    desc: 'الخيار الأكثر شعبية لمكاتب التطوير العقاري النامية',
    features: ['حتى 20 مطور وموظف', 'صياغة العقود وتوليد البنود CLM', 'فحص الامتثال ومكافحة غسيل الأموال KYC', 'تفعيل عزل بيانات المشاريع (Ethical Walls)', 'بوابة العملاء الخارجية للرسائل المشفرة', 'مساحة تخزين سحابية 250 GB'],
    popular: true,
    badge: 'الأكثر طلباً 🌟'
  },
  {
    id: 'enterprise',
    name: 'باقة الشركات الكبرى (Enterprise)',
    price: '18,500 ر.س',
    period: '/ شهرياً',
    desc: 'للمكاتب الكبرى والشركات التطويرية متعددة الفروع',
    features: ['عدد مطورن وموظفين غير محدود', 'ربط مخصص المباشر عبر API وخوادم خاصة', 'تنسيق الحوكمة وتقارير أداء المطورن المفصلة', 'دعم فني مباشر على مدار 24 ساعة مع مدير حساب خاص', 'سيرفر مستقل بالكامل مع تشفير بيانات السيادة السحابية'],
    popular: false,
    badge: 'للمؤسسات الكبرى'
  }
];

const faqs = [
  { q: 'هل النظام متوافق مع الفوترة الإلكترونية ZATCA المرحلة الثانية؟', a: 'نعم 100%، النظام يولد الفواتير الضريبية المشفرة مع شفرة Cryptographic Stamp ورموز QR المعتمدة من هيئة الزكاة والضريبة والجمارك.' },
  { q: 'كيف يتم حماية بيانات المشاريع وأسرار العملاء؟', a: 'تخضع البيانات للتشفير التام بتقنية AES-256، مع تطبيق عزل بيانات المشاريع (Ethical Walls) لمنع المطورن من الاطلاع على مشاريع تحتوي على تضارب مصالح.' },
  { q: 'هل تتوفر استضافة سحابية داخل المملكة العربية السعودية؟', a: 'نعم، يتم استضافة البيانات في مراكز بيانات معتمدة ومحلية بالمملكة متوافقة مع ضوابط الهيئة الوطنية للأمن السيبراني NCA.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [selectedPlanModal, setSelectedPlanModal] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Subscription Form State (UI/UX QA Enhanced)
  const [firmName, setFirmName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset modal state when closed
  useEffect(() => {
    if (!selectedPlanModal) {
      setFirmName('');
      setPhone('');
      setError('');
      setSubmitted(false);
      setIsSuccess(false);
    }
  }, [selectedPlanModal]);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation UX
    if (firmName.trim().length < 3) {
      setError('يرجى إدخال اسم مكتب صحيح (3 أحرف على الأقل)');
      return;
    }
    if (!/^(05\d{8})$/.test(phone.trim())) {
      setError('يرجى إدخال رقم جوال سعودي صحيح (مثال: 0501234567)');
      return;
    }

    // Loading State
    setSubmitted(true);

    // Simulate API Call Processing
    setTimeout(() => {
      setSubmitted(false);
      setIsSuccess(true); // Success State

      // Auto-redirect UX
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    }, 2000);
  };

  return (
    <div className="min-h-screen text-slate-100 font-cairo scroll-smooth">
      {/* Header / Navbar */}
      <header className="h-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-amber-500/20">
            🏢
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wide text-slate-100">رُسوخ</span>
            <span className="text-[10px] text-amber-400 font-bold block">منصة التطوير العقاري السعودية</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <a href="#features" className="hover:text-amber-400 transition-colors">المميزات</a>
          <a href="#pricing" className="hover:text-amber-400 transition-colors">الباقات والأسعار</a>
          <a href="#faq" className="hover:text-amber-400 transition-colors">الأسئلة الشائعة</a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link 
            href="/demo-account"
            className="gold-gradient-bg text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center gap-1 focus:ring-2 focus:ring-amber-500/50 outline-none"
          >
            <span>تجربة التطبيق</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-8 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>منصة أتمتة الأعمال التطويرية والتطوير العقاري الأولى بالمملكة</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight animate-fade-in-up">
          إدارة مشاريعك ووحداتك العقارية وفواتيرك الضريبية في تجربة سحابية واحدة
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in-up delay-100">
          أتمتة الفواتير الإلكترونية ZATCA Phase 2، متابعة المهام والمحاكم، إدارة عزل بيانات المشاريع، وفحص الامتثال ومكافحة غسيل الأموال في منصة واحدة آمنة ومحلية 100%.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up delay-200">
          <Link 
            href="/demo-account"
            className="w-full sm:w-auto gold-gradient-bg text-slate-950 font-extrabold px-8 py-4 rounded-2xl text-sm shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-amber-500/50 outline-none"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>تجربة التطبيق (نسخة العرض التجريبي)</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link 
            href="/login"
            className="w-full sm:w-auto glass-card hover:bg-slate-800 text-slate-200 font-bold px-8 py-4 rounded-2xl text-sm border-slate-700 transition-all focus:ring-4 focus:ring-amber-500/50 outline-none"
          >
            تسجيل دخول الموظفين والعملاء
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-100">مميزات صُممت خصيصاً للبيئة التطويرية السعودية</h2>
          <p className="text-slate-400 text-sm">كل ما يحتاجه المطور والشريك الإداري لإدارة الشركة بكفاءة وأمان مغلق</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">إدارة المشاريع الشاملة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              أتمتة ذكية لمسار المشاريع من لحظة استلامها وحتى التنفيذ، مع جدولة دقيقة وتنبيهات استباقية لمواعيد المهام والتقارير لتضمن تفوق مكتبك دائماً.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">فوترة ZATCA المعتمدة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              إصدار الفواتير الضريبية والإشعارات المشفرة (Cryptographic Stamp ورمز QR) المتوافقة بنسبة 100% مع هيئة الزكاة (المرحلة الثانية)، بضغطة زر وبدون تعقيد.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">حواجز السرية الصارمة (Ethical Walls)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              حماية تامة لمعلومات عملائك؛ النظام يمنع تعارض الصلاحيات ويقيد وصول المطورن إلى مشاريع الخصوم تلقائياً لضمان أعلى مستويات الأمان والمصداقية.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">بوابة العملاء التفاعلية</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              عزز ثقة عملائك عبر منصة خاصة تتيح لهم متابعة مستجدات مشاريعهم، تبادل المستندات المشفرة، وتسديد الدفعات بكل سهولة وشفافية على مدار الساعة.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">استضافة محلية سيادية</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              راحة بال تامة! كافة بيانات مكتبك ومستندات العملاء تستضاف حصرياً داخل حدود المملكة العربية السعودية لتتوافق كلياً مع أنظمة الهيئة الوطنية للأمن السيبراني.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">لوحات قياس ذكية (Dashboards)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              راقب أداء شركائك والمطورن، تتبع الإيرادات وحساب الساعات المفوترة لحظياً عبر تقارير مرئية دقيقة تدعم قراراتك الاستراتيجية لرفع أرباح الشركة.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="py-20 px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>خطط الاشتراكات المرنة</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100">باقات تناسب جميع المكاتب والشركات التطويرية</h2>
          <p className="text-slate-400 text-sm">اختر الباقة المناسبة لمكتبك واشترك فورياً مع فترة تجربة مجانية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((p) => (
            <div 
              key={p.id} 
              className={`glass-card p-8 rounded-3xl space-y-6 relative flex flex-col justify-between transition-all duration-300 ${
                p.popular ? 'border-amber-400/60 shadow-2xl shadow-amber-500/10 bg-slate-900/90 scale-105 z-10' : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gold-gradient-bg text-slate-950 font-extrabold px-4 py-1 rounded-full text-xs shadow-md whitespace-nowrap">
                  {p.badge}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-100">{p.name}</h3>
                <p className="text-xs text-slate-400 h-8">{p.desc}</p>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-3xl font-black text-amber-400 font-mono">{p.price}</span>
                  <span className="text-xs text-slate-400 font-semibold">{p.period}</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-200 min-h-[160px]">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedPlanModal(p)}
                className={`w-full font-extrabold py-3.5 rounded-2xl text-xs transition-all cursor-pointer focus:ring-4 focus:outline-none ${
                  p.popular
                    ? 'gold-gradient-bg text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 focus:ring-amber-500/50'
                    : 'glass-card hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500 focus:ring-slate-500/50'
                }`}
              >
                اشترك الآن في {p.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-100">الأسئلة الشائعة</h2>
          <p className="text-slate-400 text-sm">إجابات على أبرز الاستفسارات التقنية والنظامية</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <button 
              key={i} 
              className="w-full text-right glass-card glass-card-hover p-6 rounded-2xl space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" 
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
            >
              <div className="flex items-center justify-between font-bold text-sm text-slate-100">
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
              </div>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === i ? 'max-h-40 opacity-100 pt-3 mt-3 border-t border-slate-800/60' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SUBSCRIBE MODAL */}
      {selectedPlanModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`glass-card p-8 rounded-3xl w-full max-w-lg border-amber-500/30 transition-all duration-500 transform ${selectedPlanModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            
            {!isSuccess && !submitted && (
              <button 
                onClick={() => setSelectedPlanModal(null)} 
                className="absolute top-6 left-6 text-slate-400 hover:text-white font-bold p-1 rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 z-10"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {isSuccess ? (
              <div className="text-center space-y-5 py-8 animate-fade-in-up">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                  <Check className="w-10 h-10 text-emerald-400 relative z-10 animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-slate-100">تم تفعيل حساب الشركة بنجاح!</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                  تم استلام طلبكم وتكوين مساحة عملكم المعزولة على منصة رُسوخ.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 mt-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري تحويلك إلى لوحة تسجيل الدخول...
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-5">
                  <h3 className="font-bold text-xl text-slate-100 pr-2">الاشتراك في {selectedPlanModal.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-amber-400 font-mono font-bold px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      {selectedPlanModal.price} {selectedPlanModal.period}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubscribeSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">اسم شركة التطوير العقاري / الشركة</label>
                    <input
                      type="text"
                      required
                      disabled={submitted}
                      placeholder="مثال: شركة الأفق للتطوير العقاري"
                      value={firmName}
                      onChange={(e) => {
                        setFirmName(e.target.value);
                        if(error) setError('');
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">رقم الجوال لتفعيل الحساب (واتساب)</label>
                    <div className="relative">
                      <PhoneCall className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        disabled={submitted}
                        placeholder="050XXXXXXX"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if(error) setError('');
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-11 pl-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      يتضمن الاشتراك:
                    </p>
                    <p className="leading-relaxed">14 يوماً تجربة مجانية كاملة الميزات بدون التزام مالي مسبق، مع دعم فني مخصص لنقل بيانات مكتبك بسلاسة.</p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitted}
                      className={`w-full gold-gradient-bg text-slate-950 font-extrabold py-3.5 rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-amber-500/50 ${
                        submitted ? 'opacity-80 cursor-not-allowed shadow-none' : 'hover:scale-[1.02] shadow-amber-500/20'
                      }`}
                    >
                      {submitted ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>جاري إنشاء بيئة العمل المخصصة...</span>
                        </>
                      ) : (
                        <span>تأكيد الاشتراك وتفعيل حساب الشركة</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-8 text-center text-xs text-slate-500 bg-[#0b1329]">
        <p>© 2026 رُسوخ. جميع الحقوق محفوظة لشركات التطوير العقاري.</p>
      </footer>
    </div>
  );
}
