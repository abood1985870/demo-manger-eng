'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Briefcase, 
  Scale, 
  Receipt, 
  ArrowLeft, 
  CheckCircle2, 
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
import Image from 'next/image';

const plans = [
  {
    id: 'basic',
    name: 'باقة المكاتب الناشئة (Basic)',
    price: '2,900 ر.س',
    period: '/ شهرياً',
    desc: 'مثالية للمكاتب الفردية والمطورين المستقلين',
    features: ['حتى 5 مطورين وموظفين', 'إدارة المشاريع والمهام الميدانية', 'الفوترة الإلكترونية ZATCA المرحلة الأولى والثانية', 'مساحة تخزين سحابية 50 GB', 'دعم فني عبر البريد والواتساب'],
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
    features: ['عدد مطورين وموظفين غير محدود', 'ربط مخصص المباشر عبر API وخوادم خاصة', 'تنسيق الحوكمة وتقارير أداء المطورين المفصلة', 'دعم فني مباشر على مدار 24 ساعة مع مدير حساب خاص', 'سيرفر مستقل بالكامل مع تشفير بيانات السيادة السحابية'],
    popular: false,
    badge: 'للمؤسسات الكبرى'
  }
];

const faqs = [
  { q: 'هل النظام متوافق مع الفوترة الإلكترونية ZATCA المرحلة الثانية؟', a: 'نعم 100%، النظام يولد الفواتير الضريبية المشفرة مع شفرة Cryptographic Stamp ورموز QR المعتمدة من هيئة الزكاة والضريبة والجمارك.' },
  { q: 'كيف يتم حماية بيانات المشاريع وأسرار العملاء؟', a: 'تخضع البيانات للتشفير التام بتقنية AES-256، مع تطبيق عزل بيانات المشاريع (Ethical Walls) لمنع الموظفين من الاطلاع على مشاريع تحتوي على تضارب مصالح.' },
  { q: 'هل تتوفر استضافة سحابية داخل المملكة العربية السعودية؟', a: 'نعم، يتم استضافة البيانات في مراكز بيانات معتمدة ومحلية بالمملكة متوافقة مع ضوابط الهيئة الوطنية للأمن السيبراني NCA.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [selectedPlanModal, setSelectedPlanModal] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [firmName, setFirmName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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

    if (firmName.trim().length < 3) {
      setError('يرجى إدخال اسم شركة صحيح (3 أحرف على الأقل)');
      return;
    }
    if (!/^(05\d{8})$/.test(phone.trim())) {
      setError('يرجى إدخال رقم جوال سعودي صحيح (مثال: 0501234567)');
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-cairo scroll-smooth selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Navbar - Glassmorphism */}
      <header className="fixed w-full top-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl px-8 h-20 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform">
            🏢
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wide text-white">رُسوخ</span>
            <span className="text-[10px] text-amber-400 font-bold block">منصة التطوير العقاري</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
          <a href="#features" className="hover:text-amber-400 transition-colors">المميزات و التقنيات</a>
          <a href="#pricing" className="hover:text-amber-400 transition-colors">الباقات الاستثمارية</a>
          <a href="#faq" className="hover:text-amber-400 transition-colors">دعم الشركاء</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login"
            className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            دخول الموظفين
          </Link>
          <a 
            href="#pricing"
            className="bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all hover:-translate-y-0.5"
          >
            ابدأ التطوير الآن
          </a>
        </div>
      </header>

      {/* Hero Section with AI Background */}
      <section className="relative min-h-[95vh] flex items-center justify-center px-8 pt-20 overflow-hidden">
        {/* Deep background image with overlays */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero_bg.png" 
            alt="Futuristic Real Estate" 
            layout="fill" 
            objectFit="cover" 
            quality={100}
            className="opacity-40 object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <div className="flex-1 text-center lg:text-right space-y-8 animate-in slide-in-from-bottom-8 duration-1000 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-400 text-xs font-bold backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>المنصة السحابية الأولى للتطوير العقاري بالمملكة</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.2] lg:leading-[1.1]">
              نحو حقبة جديدة في <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 to-amber-600">
                التطوير العقاري الرقمي
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              ارتقِ بإدارة مخزونك العقاري، ومبيعاتك، ومشاريعك الهندسية من منصة واحدة ذكية تلبي كافة متطلبات البيع على الخارطة (وافي) والفوترة الإلكترونية وتوفر لك لوحات تحكم ترسم مستقبل شركتك.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a 
                href="#pricing"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 font-extrabold px-8 py-4 rounded-2xl text-base shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                تصفح الباقات
                <ArrowLeft className="w-5 h-5" />
              </a>
              <Link 
                href="/portal"
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-2xl text-base backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                دخول بوابة العملاء والمستثمرين
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full relative perspective-1000 animate-in slide-in-from-right-16 duration-1000 fade-in delay-200">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] transform -rotate-y-6 rotate-x-6 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent z-10 pointer-events-none mix-blend-overlay"></div>
              <Image 
                src="/images/dashboard_mockup.png" 
                alt="Rusukh Dashboard Mockup" 
                layout="fill" 
                objectFit="cover"
                quality={100}
                className="scale-105 hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              
              {/* AI Insight Card */}
              <div className="absolute -left-2 top-1/4 w-64 bg-slate-900/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-left-8 fade-in duration-1000 delay-700 hidden md:block">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span className="text-xs font-bold text-amber-500">Rusukh AI</span>
                </div>
                <p className="text-sm text-slate-300 font-bold mb-1">تسارع مبيعات إيجابي</p>
                <p className="text-xs text-slate-500">من المتوقع بيع 80% من مخزون "برج رسوخ" خلال 3 أشهر بناءً على سرعة البيع الحالية.</p>
              </div>

              {/* Escrow Sync Card */}
              <div className="absolute -right-2 bottom-1/4 w-56 bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-right-8 fade-in duration-1000 delay-1000 hidden md:block z-20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold text-emerald-500">Wafi Sync Active</span>
                </div>
                <p className="text-xl font-black text-white">45M <span className="text-sm font-normal text-slate-400">SAR</span></p>
                <p className="text-[10px] text-slate-500">تم تحديث الرصيد المتاح للصرف</p>
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce-slow z-30">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold">متوافق 100%</p>
                <p className="text-xs text-slate-400">مع وافي وهيئة الزكاة</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-8 max-w-7xl mx-auto space-y-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        
        <div className="text-center space-y-4">
          <h2 className="text-4xl lg:text-5xl font-black text-white">ترسانة تقنية <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 to-amber-600">متكاملة</span></h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">صممنا رُسوخ ليكون العقل المدبر لشركتك العقارية، ليوفر لك أدوات لا غنى عنها للسيطرة على السوق.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: 'إدارة المخزون التفاعلية', desc: 'مخططات شبكية بانورامية وتتبع فوري لمبيعات الوحدات ونسب الإنجاز.', color: 'amber' },
            { icon: Receipt, title: 'فوترة ZATCA المعتمدة', desc: 'إصدار فواتير ضريبية مشفرة برمز QR متوافقة كلياً مع متطلبات الزكاة والدخل.', color: 'emerald' },
            { icon: Scale, title: 'منصة وافي والمطالبات', desc: 'إدارة مبيعات الخارطة وربط حسابات الضمان وإدارة المطالبات والعقود.', color: 'blue' },
            { icon: Briefcase, title: 'بوابة المستثمرين', desc: 'منصة خارجية خاصة لعملائك ومستثمرك لمتابعة العوائد وتقدم الإنشاءات.', color: 'purple' },
            { icon: Lock, title: 'أمان سيادي مطلق', desc: 'استضافة بياناتك سحابياً داخل المملكة بما يتوافق مع هيئة الأمن السيبراني.', color: 'rose' },
            { icon: Zap, title: 'لوحات قياس ذكية BI', desc: 'تقارير مالية وهندسية مرئية متقدمة لاتخاذ قرارات استراتيجية حاسمة.', color: 'cyan' },
          ].map((feat, idx) => (
            <div key={idx} className="group bg-slate-900/40 border border-white/5 hover:border-amber-500/30 p-8 rounded-3xl space-y-5 backdrop-blur-sm transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(245,158,11,0.1)]">
              <div className={`w-14 h-14 rounded-2xl bg-${feat.color}-500/10 border border-${feat.color}-500/20 flex items-center justify-center text-${feat.color}-400 group-hover:scale-110 transition-transform`}>
                <feat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="py-32 px-8 max-w-7xl mx-auto space-y-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>استثمار استراتيجي</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white">باقات صممت لنجاحك</h2>
          <p className="text-slate-400 text-lg">اختر الباقة التي تلبي حجم طموحاتك وابدأ اليوم.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {plans.map((p) => (
            <div 
              key={p.id} 
              className={`bg-slate-900/60 backdrop-blur-lg p-8 rounded-3xl space-y-8 relative flex flex-col justify-between transition-all duration-500 border ${
                p.popular 
                  ? 'border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.15)] lg:scale-105 z-10 before:absolute before:inset-0 before:bg-gradient-to-b before:from-amber-500/10 before:to-transparent before:rounded-3xl before:pointer-events-none' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 font-black px-6 py-1.5 rounded-full text-xs shadow-lg whitespace-nowrap">
                  {p.badge}
                </div>
              )}

              <div className="space-y-5 relative z-10">
                <h3 className="text-2xl font-bold text-white">{p.name}</h3>
                <p className="text-sm text-slate-400 h-10">{p.desc}</p>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 font-mono">{p.price}</span>
                  <span className="text-sm text-slate-500 font-bold">{p.period}</span>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10 text-sm text-slate-300 min-h-[220px]">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                      <span className="leading-relaxed font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedPlanModal(p)}
                className={`w-full font-black py-4 rounded-2xl text-sm transition-all cursor-pointer relative z-10 ${
                  p.popular
                    ? 'bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:-translate-y-1'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
                }`}
              >
                اشترك الآن وابدأ فوراً
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SUBSCRIBE MODAL (SLIDE UP) */}
      {selectedPlanModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => !isSuccess && !submitted && setSelectedPlanModal(null)}></div>
          
          <div className={`relative bg-slate-900 border border-amber-500/20 p-8 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(245,158,11,0.1)] transition-all duration-500 transform animate-in slide-in-from-bottom-10 fade-in`}>
            
            {!isSuccess && !submitted && (
              <button 
                onClick={() => setSelectedPlanModal(null)} 
                className="absolute top-6 left-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {isSuccess ? (
              <div className="text-center space-y-6 py-10">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                  <Check className="w-12 h-12 text-emerald-400 relative z-10 animate-bounce" />
                </div>
                <h3 className="text-3xl font-black text-white">خطوتك الأولى نحو الريادة!</h3>
                <p className="text-base text-slate-400 leading-relaxed max-w-xs mx-auto">
                  تم تجهيز بيئة عمل مكتبك بأعلى معايير الحماية والتشفير.
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-emerald-400 mt-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري تحويلك إلى لوحة تسجيل الدخول...
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="border-b border-white/10 pb-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="font-black text-2xl text-white mb-2">تفعيل حساب الشركة</h3>
                  <p className="text-amber-400 font-mono font-bold text-sm">
                    {selectedPlanModal.name} — {selectedPlanModal.price} {selectedPlanModal.period}
                  </p>
                </div>

                <form onSubmit={handleSubscribeSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">اسم شركة التطوير العقاري</label>
                      <input
                        type="text"
                        required
                        disabled={submitted}
                        placeholder="مثال: شركة الأفق للتطوير العقاري"
                        value={firmName}
                        onChange={(e) => { setFirmName(e.target.value); setError(''); }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">رقم الجوال لتفعيل الحساب</label>
                      <div className="relative">
                        <PhoneCall className="w-5 h-5 text-slate-500 absolute right-5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          disabled={submitted}
                          placeholder="050XXXXXXX"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setError(''); }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-14 pl-5 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 font-mono transition-all disabled:opacity-50 text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-slate-400 leading-relaxed text-center">
                    باشتراكك أنت توافق على معالجة البيانات وفق متطلبات <span className="text-amber-400 font-bold">هيئة الأمن السيبراني السعودية</span>.
                  </div>

                  <button
                    type="submit"
                    disabled={submitted}
                    className={`w-full bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 font-black py-4 rounded-xl text-base transition-all flex items-center justify-center gap-3 ${
                      submitted ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-1'
                    }`}
                  >
                    {submitted ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>جاري بناء بيئة العمل الآمنة...</span>
                      </>
                    ) : (
                      <span>تأكيد وإنشاء الحساب</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-8 text-center text-sm font-bold text-slate-500 bg-slate-950 mt-20">
        <p>مصمم بفخر في المملكة العربية السعودية 🇸🇦 لخدمة قطاع التطوير العقاري.</p>
        <p className="mt-2 text-xs">© 2026 رُسوخ. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
