'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  TrendingUp,
  Clock3,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ArrowLeft,
  CircleDollarSign,
  Banknote,
  Search,
  Filter,
  Users,
  FileText,
  PieChart,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Check
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

// Mock data for demo without any backend or supabase reliance
const MOCK_SUMMARY = {
  companyName: 'شركة الأفق للتطوير العقاري (حساب تجريبي)',
  executive: {
    projectValue: 450000000,
    overallProgress: 68,
    spi: 1.05,
    cpi: 0.98,
    totalUnits: 320,
    soldUnits: 245,
    collectedAmount: 285000000,
    salesRate: 0.765,
  }
};

const MOCK_PROJECTS = [
  {
    id: 'demo-1',
    code: 'PRJ-2026-01',
    title: 'مجمع برج الأفق السكني',
    city: 'الرياض - حي حطين',
    stage: 'التشطيبات',
    health: 'ON_TRACK',
    progress: 78,
    budget: 180000000,
    plannedEnd: '2026-11-30',
    totalUnits: 120,
    soldUnits: 102,
    responsible: 'م. فهد السلمان'
  },
  {
    id: 'demo-2',
    code: 'PRJ-2026-02',
    title: 'مشروع ضاحية النخيل الفندقي',
    city: 'جدة - الشاطئ',
    stage: 'الأعمال الكهروميكانيكية',
    health: 'WATCH',
    progress: 55,
    budget: 140000000,
    plannedEnd: '2027-03-15',
    totalUnits: 90,
    soldUnits: 65,
    responsible: 'م. سارة العتيبي'
  },
  {
    id: 'demo-3',
    code: 'PRJ-2026-03',
    title: 'مركز درة الرياض التجاري',
    city: 'الرياض - النرجس',
    stage: 'الهيكل الإنشائي',
    health: 'ON_TRACK',
    progress: 42,
    budget: 85000000,
    plannedEnd: '2027-01-20',
    totalUnits: 60,
    soldUnits: 48,
    responsible: 'م. خالد الغامدي'
  },
  {
    id: 'demo-4',
    code: 'PRJ-2026-04',
    title: 'مجمع الواحة الفاخر',
    city: 'الخبر - الحزام الذهبي',
    stage: 'التخطيط والتراخيص',
    health: 'DELAYED',
    progress: 20,
    budget: 45000000,
    plannedEnd: '2027-06-30',
    totalUnits: 50,
    soldUnits: 30,
    responsible: 'م. عبدالله الشهري'
  }
];

const MOCK_COMPLIANCE = [
  { label: 'شهادة إتمام البناء والامتثال', project: 'برج الأفق السكني', status: 'مكتمل', color: 'emerald' },
  { label: 'اعتماد المخططات الإنشائية', project: 'ضاحية النخيل الفندقي', status: 'قيد المراجعة', color: 'amber' },
  { label: 'ترخيص وافي للبيع على الخارطة', project: 'مركز درة الرياض', status: 'مكتمل', color: 'emerald' },
  { label: 'موافقة الدفاع المدني والسلامة', project: 'مجمع الواحة الفاخر', status: 'تحتاج إجراء', color: 'rose' },
];

const MOCK_ALERTS = [
  { id: '1', title: 'تأخر توريد مصاعد المرحلة الثانية', project: 'ضاحية النخيل الفندقي', severity: 'عالي' },
  { id: '2', title: 'تحديث تراخيص منصة وافي', project: 'مجمع الواحة الفاخر', severity: 'متوسط' },
];

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} مليار ر.س`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} مليون ر.س`;
  }
  return `${value.toLocaleString('ar-SA')} ر.س`;
}

export default function DemoAccountPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'sales' | 'compliance'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<typeof MOCK_PROJECTS[0] | null>(null);

  const filteredProjects = MOCK_PROJECTS.filter(p => 
    p.title.includes(searchQuery) || p.city.includes(searchQuery) || p.code.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-cairo dir-rtl">
      {/* Top Demo Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border-b border-amber-500/30 py-2.5 px-4 text-center text-xs font-extrabold text-amber-300 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>وضع العرض التجريبي التفاعلي (نسخة الاستعراض بدون قواعد بيانات)</span>
        <span className="bg-amber-500/30 px-2 py-0.5 rounded-full text-[10px] text-amber-200 border border-amber-400/40">تفاعلي 100%</span>
      </div>

      {/* Navigation Header */}
      <header className="h-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-amber-500/20">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wide text-slate-100">رُسوخ</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">حساب تجربة</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">شركة الأفق للتطوير العقاري</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            النظرة العامة
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'projects' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            المشاريع ({MOCK_PROJECTS.length})
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sales' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            المبيعات والتحصيل
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'compliance' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            التراخيص والامتثال
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/landing"
            className="glass-card hover:bg-slate-800 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs border-slate-700 transition-all flex items-center gap-1.5"
          >
            <span>العودة للرئيسية</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100">
              لوحة قيادة التطوير العقاري
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
              استعراض حي لجميع المؤشرات التشغيلية والمالية لنظام رُسوخ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>إجمالي قيمة المحفظة: <b className="text-amber-400 font-mono">450,000,000 ر.س</b></span>
            </div>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-card p-6 rounded-3xl border-slate-800 hover:border-amber-500/30 transition-all space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-400">قيمة المحفظة العقارية</p>
                <div className="text-2xl font-black text-slate-100 font-mono">450 مليون ر.س</div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> 4 مشاريع نشطة بالمملكة
                </p>
              </div>

              <div className="glass-card p-6 rounded-3xl border-slate-800 hover:border-emerald-500/30 transition-all space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-400">متوسط نسبة الإنجاز</p>
                <div className="text-2xl font-black text-slate-100 font-mono">68%</div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl border-slate-800 hover:border-blue-500/30 transition-all space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Clock3 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-400">كفاءة الجدول الزمني (SPI)</p>
                <div className="text-2xl font-black text-slate-100 font-mono">1.05</div>
                <p className="text-[11px] text-emerald-400 font-semibold">أعلى من المخطط الزمني 👍</p>
              </div>

              <div className="glass-card p-6 rounded-3xl border-slate-800 hover:border-purple-500/30 transition-all space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Coins className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-400">كفاءة التكلفة (CPI)</p>
                <div className="text-2xl font-black text-slate-100 font-mono">0.98</div>
                <p className="text-[11px] text-amber-400 font-semibold">ضمن حدود الكفاءة المستهدفة</p>
              </div>
            </div>

            {/* Projects Overview List & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Projects Table View */}
              <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">المشاريع الحالية</h2>
                    <p className="text-xs text-slate-400">أداء ووحدات المشاريع المفتوحة</p>
                  </div>
                  <button onClick={() => setActiveTab('projects')} className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
                    <span>عرض التفاصيل</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {MOCK_PROJECTS.map((project) => (
                    <div 
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{project.title}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">{project.code}</span>
                        </div>
                        <p className="text-xs text-slate-400">{project.city} · {project.stage}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">الإنجاز</p>
                          <p className="font-bold text-sm text-emerald-400 font-mono">{project.progress}%</p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-400">الميزانية</p>
                          <p className="font-bold text-sm text-amber-400 font-mono">{(project.budget / 1000000).toFixed(0)}m ر.س</p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          project.health === 'ON_TRACK' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          project.health === 'WATCH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {project.health === 'ON_TRACK' ? 'على المسار' : project.health === 'WATCH' ? 'متابعة' : 'متأخر'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Alerts & Quick Stats */}
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      تنبيهات وتوصيات
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {MOCK_ALERTS.map(alert => (
                      <div key={alert.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{alert.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            alert.severity === 'عالي' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>{alert.severity}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{alert.project}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    حالة تراخيص وافي والامتثال
                  </h3>
                  <div className="space-y-2">
                    {MOCK_COMPLIANCE.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 text-xs">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className={`font-bold ${
                          item.color === 'emerald' ? 'text-emerald-400' : item.color === 'amber' ? 'text-amber-400' : 'text-rose-400'
                        }`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Projects List */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث باسم المشروع أو المدينة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="text-xs text-slate-400 font-semibold">
                تم العثور على {filteredProjects.length} مشاريع
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="glass-card p-6 rounded-3xl space-y-5 border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{project.code}</span>
                      <h3 className="font-bold text-lg text-slate-100 mt-1">{project.title}</h3>
                      <p className="text-xs text-slate-400">{project.city}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      project.health === 'ON_TRACK' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      project.health === 'WATCH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {project.health === 'ON_TRACK' ? 'على المسار' : project.health === 'WATCH' ? 'تحتاج متابعة' : 'متأخر'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">نسبة التقدم الإنشائي</span>
                      <span className="text-emerald-400 font-mono">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <p className="text-slate-400">الميزانية التقديرية</p>
                      <p className="font-bold text-slate-100 font-mono mt-0.5">{formatCompactCurrency(project.budget)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">الوحدات المباعة</p>
                      <p className="font-bold text-amber-400 font-mono mt-0.5">{project.soldUnits} / {project.totalUnits} وحدة</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="w-full glass-card hover:bg-slate-800 text-slate-200 font-bold py-2.5 rounded-xl text-xs border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>عرض تفاصيل المشروع الكاملة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Sales & Collection */}
        {activeTab === 'sales' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-3xl space-y-2">
                <p className="text-xs font-bold text-slate-400">إجمالي الوحدات العقارية</p>
                <div className="text-3xl font-black text-slate-100 font-mono">320 وحدة</div>
                <p className="text-xs text-slate-400">موزعة على 4 مشاريع تطويرية</p>
              </div>

              <div className="glass-card p-6 rounded-3xl space-y-2">
                <p className="text-xs font-bold text-slate-400">الوحدات المباعة</p>
                <div className="text-3xl font-black text-emerald-400 font-mono">245 وحدة (76%)</div>
                <p className="text-xs text-slate-400">مبيعات سريعة عبر الخارطة (وافي)</p>
              </div>

              <div className="glass-card p-6 rounded-3xl space-y-2">
                <p className="text-xs font-bold text-slate-400">إجمالي النقد المحصل</p>
                <div className="text-3xl font-black text-amber-400 font-mono">285 مليون ر.س</div>
                <p className="text-xs text-slate-400">مستودعة بحسابات الإسقاط والضمان</p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-6">
              <h2 className="text-lg font-bold text-slate-100">توزيع المبيعات بحسب المشروع</h2>
              <div className="space-y-5">
                {MOCK_PROJECTS.map(p => {
                  const rate = Math.round((p.soldUnits / p.totalUnits) * 100);
                  return (
                    <div key={p.id} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-200">{p.title}</span>
                        <span className="text-amber-400 font-mono">{p.soldUnits} من {p.totalUnits} وحدة ({rate}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Compliance */}
        {activeTab === 'compliance' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 rounded-3xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-100">سجل الامتثال والتراخيص الحكومية (بلدي / وافي / الدفاع المدني)</h2>
                <p className="text-xs text-slate-400 mt-1">متابعة دقيقة لكل التراخيص والموافقات الرسمية للمشاريع</p>
              </div>

              <div className="space-y-3">
                {MOCK_COMPLIANCE.map((item, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-400">المشروع: {item.project}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      item.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal for Project Detail Preview */}
        {selectedProject && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card p-8 rounded-3xl w-full max-w-lg border-amber-500/30 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{selectedProject.code}</span>
                  <h3 className="text-xl font-bold text-slate-100 mt-1">{selectedProject.title}</h3>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white font-bold p-2">✕</button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div>
                    <p className="text-slate-400">الموقع والمدينة</p>
                    <p className="font-bold text-slate-200 mt-0.5">{selectedProject.city}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">المرحلة الحالية</p>
                    <p className="font-bold text-slate-200 mt-0.5">{selectedProject.stage}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">مدير المشروع</p>
                    <p className="font-bold text-slate-200 mt-0.5">{selectedProject.responsible}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">الموعد المستهدف للتسليم</p>
                    <p className="font-bold text-slate-200 mt-0.5">{selectedProject.plannedEnd}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-300">نسبة التقدم الكلي</span>
                    <span className="text-emerald-400 font-mono">{selectedProject.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${selectedProject.progress}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="w-full gold-gradient-bg text-slate-950 font-extrabold py-3 rounded-xl text-xs cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  إغلاق المعاينة
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>© 2026 رُسوخ - إدارة مشاريع المطورين العقاريين. جميع البيانات المعروضة وهمية بغرض التجربة.</p>
      </footer>
    </div>
  );
}
