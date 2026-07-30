'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Loader2, Search, Sparkles, Trash2, Power, FilePlus2, X } from 'lucide-react';
import { PRACTICE_AREAS, PRACTICE_AREA_NAMES, TEMPLATE_TYPES, TEMPLATE_TYPE_NAMES, TEMPLATE_VARIABLES } from '@/lib/legal-template-constants';
import { MATTER_STATUS_ARABIC, MatterStatus } from '@/lib/matter-status';

function buildTemplatePreview(template: any, matter: any) {
  if (!template || !matter) return '';
  const today = new Date().toLocaleDateString('ar-SA');
  const replacements: Record<string, string> = {
    '{{clientName}}': matter.client?.name || matter.externalPartyName || '[يحتاج تعبئة يدوية: اسم العميل]',
    '{{beneficiaryName}}': matter.beneficiaryAccount?.name || '[يحتاج تعبئة يدوية: الحساب المستفيد]',
    '{{caseNumber}}': matter.caseNumber || matter.id.substring(0, 8),
    '{{matterTitle}}': matter.title,
    '{{courtName}}': matter.developmentProfile?.city || matter.externalPartyName || '[يحتاج تعبئة يدوية: الموقع أو الجهة]',
    '{{opponentName}}': matter.externalPartyName || '[يحتاج تعبئة يدوية: المورد أو المقاول]',
    '{{lawyerName}}': matter.lawyer?.name || '[يحتاج تعبئة يدوية: مدير المشروع]',
    '{{companyName}}': 'شركة التطوير العقاري',
    '{{today}}': today,
    '{{matterStatus}}': MATTER_STATUS_ARABIC[matter.status as MatterStatus] || matter.status,
    '{{claimAmount}}': String(matter.developmentProfile?.projectValue || '[يحتاج تعبئة يدوية: قيمة المشروع]'),
    '{{hearingDate}}': matter.nextAppointment?.date ? new Date(matter.nextAppointment.date).toLocaleDateString('ar-SA') : today,
  };
  const aliases: Record<string, string> = {
    '{{client_name}}': replacements['{{clientName}}'],
    '{{beneficiary_name}}': replacements['{{beneficiaryName}}'],
    '{{case_number}}': replacements['{{caseNumber}}'],
    '{{matter_title}}': replacements['{{matterTitle}}'],
    '{{court_name}}': replacements['{{courtName}}'],
    '{{opponent_name}}': replacements['{{opponentName}}'],
    '{{lawyer_name}}': replacements['{{lawyerName}}'],
    '{{company_name}}': replacements['{{companyName}}'],
    '{{current_date}}': replacements['{{today}}'],
    '{{matter_status}}': replacements['{{matterStatus}}'],
    '{{project_value}}': replacements['{{claimAmount}}'],
    '{{hearing_date}}': replacements['{{hearingDate}}'],
  };
  return Object.entries({ ...replacements, ...aliases }).reduce((content, [tag, value]) => content.split(tag).join(value), template.content);
}

export default function LegalTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [matters, setMatters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [userRole, setUserRole] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [usageTemplate, setUsageTemplate] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationForm, setGenerationForm] = useState({ matterId: '', customTitle: '', editedContent: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    practiceArea: 'LABOR',
    templateType: 'DEMAND_LETTER',
    content: '',
    isActive: true,
  });

  const isManager = ['ADMIN', 'OWNER', 'SUPERADMIN'].includes(userRole.toUpperCase());

  useEffect(() => {
    setUserRole(sessionStorage.getItem('userRole') || '');
    void Promise.all([fetchTemplates(), fetchMatters()]);
  }, []);

  const fetchMatters = async () => {
    try {
      const res = await fetch('/api/lawyer/matters');
      if (res.ok) setMatters(await res.json());
    } catch (e) {
      console.error('Error fetching projects for templates', e);
    }
  };

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/lawyer/templates');
      if (res.ok) {
        setTemplates(await res.json());
      }
    } catch (e) {
      console.error('Error fetching templates', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setIsSubmitting(true);
    try {
      const isEdit = Boolean(form.id);
      const url = isEdit ? `/api/lawyer/templates/${form.id}` : '/api/lawyer/templates';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        setForm({ id: '', title: '', description: '', practiceArea: 'LABOR', templateType: 'DEMAND_LETTER', content: '', isActive: true });
        await fetchTemplates();
        alert(isEdit ? 'تم تحديث القالب بنجاح.' : 'تمت إضافة قالب المشروع بنجاح.');
      } else {
        const data = await res.json();
        alert(data.error || 'فشلت العملية');
      }
    } catch (err) {
      alert('حدث خطأ في النظام');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (template: any) => {
    try {
      const res = await fetch(`/api/lawyer/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !template.isActive }),
      });
      if (res.ok) {
        await fetchTemplates();
      }
    } catch (e) {
      console.error('Error toggling template active status', e);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;
    try {
      const res = await fetch(`/api/lawyer/templates/${templateId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchTemplates();
        alert('تم حذف القالب بنجاح.');
      } else {
        const data = await res.json();
        alert(data.error || 'فشل حذف القالب');
      }
    } catch (e) {
      alert('حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  const openTemplateUsage = (template: any) => {
    setUsageTemplate(template);
    setGenerationForm({ matterId: '', customTitle: template.title, editedContent: template.content });
  };

  const handleMatterSelection = (matterId: string) => {
    const matter = matters.find((item) => item.id === matterId);
    setGenerationForm({
      matterId,
      customTitle: matter ? `${usageTemplate.title} - ${matter.caseNumber || matter.title}` : usageTemplate.title,
      editedContent: matter ? buildTemplatePreview(usageTemplate, matter) : usageTemplate.content,
    });
  };

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageTemplate || !generationForm.matterId) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/lawyer/matters/${generationForm.matterId}/generate-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: usageTemplate.id,
          customTitle: generationForm.customTitle,
          editedContent: generationForm.editedContent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'تعذر إنشاء المستند من القالب');
        return;
      }
      setUsageTemplate(null);
      setGenerationForm({ matterId: '', customTitle: '', editedContent: '' });
      alert('تم إنشاء المستند وحفظه داخل ملفات المشروع بنجاح.');
    } catch (e) {
      alert('حدث خطأ أثناء إنشاء المستند');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.title.includes(searchTerm) || (t.description || '').includes(searchTerm) || t.content.includes(searchTerm);
    const matchesArea = selectedPracticeArea === 'all' || t.practiceArea === selectedPracticeArea;
    const matchesType = selectedType === 'all' || t.templateType === selectedType;
    return matchesSearch && matchesArea && matchesType;
  });

  return (
    <div className="space-y-6 font-cairo text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-amber-400" />
            <span>مكتبة قوالب ومسودات المشاريع</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">أنشئ القالب مرة واحدة، ثم استخدمه كمسودة قابلة للتعديل واحفظها في ملفات أي مشروع.</p>
        </div>

        {isManager && (
          <button
            onClick={() => {
              setForm({ id: '', title: '', description: '', practiceArea: 'LABOR', templateType: 'DEMAND_LETTER', content: '', isActive: true });
              setShowModal(true);
            }}
            className="gold-gradient-bg text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> <span>إضافة قالب مشروع جديد</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-slate-300 sm:grid-cols-3">
        <div><span className="font-black text-emerald-300">1.</span> اختر القالب المناسب.</div>
        <div><span className="font-black text-emerald-300">2.</span> اضغط «استخدام القالب» وحدد المشروع.</div>
        <div><span className="font-black text-emerald-300">3.</span> راجع المسودة ثم احفظها في ملفات المشروع.</div>
      </div>

      {/* Variables Cheat Sheet Helper */}
      <div className="rounded-2xl border border-amber-500/20 bg-slate-900/90 p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>المتغيرات الذكية المتاحة للحقن التلقائي بداخل محتوى القالب:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
          {TEMPLATE_VARIABLES.map((v, idx) => (
            <div key={idx} className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 flex flex-col gap-0.5">
              <code className="text-amber-400 font-bold">{v.tag}</code>
              <span className="text-[10px] text-slate-400 font-sans">{v.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Areas Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 subtle-scroll">
        <button
          onClick={() => setSelectedPracticeArea('all')}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ${selectedPracticeArea === 'all' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
        >
          جميع التخصصات
        </button>
        {PRACTICE_AREAS.map((area) => (
          <button
            key={area.id}
            onClick={() => setSelectedPracticeArea(area.id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ${selectedPracticeArea === area.id ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
          >
            {area.name}
          </button>
        ))}
      </div>

      {/* Search & Type Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في عنوان القالب، الوصف، أو المحتوى..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pr-10 pl-4 text-xs text-slate-100 outline-none focus:border-amber-500/50"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500/50 cursor-pointer"
        >
          <option value="all">جميع أنواع القوالب</option>
          {TEMPLATE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" /></div>
      ) : filteredTemplates.length === 0 ? (
        <div className="glass-card rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300">لا توجد قوالب تطويرية مطابقة</p>
          <p className="text-xs mt-1">يمكنك إضافة قالب جديد بالضغط على الزر في الأعلى.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`glass-card rounded-2xl border p-5 transition flex flex-col justify-between space-y-4 ${
                template.isActive ? 'border-slate-800/80 hover:border-amber-500/30' : 'border-rose-500/20 bg-rose-950/10 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      🏗️ {PRACTICE_AREA_NAMES[template.practiceArea] || template.practiceArea}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      📄 {TEMPLATE_TYPE_NAMES[template.templateType] || template.templateType}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${template.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {template.isActive ? 'مفعل' : 'معطل'}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-100 mb-1">{template.title}</h3>
                {template.description && <p className="text-xs text-slate-400 mb-3">{template.description}</p>}

                <pre className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl whitespace-pre-wrap font-sans border border-slate-800/50 max-h-40 overflow-y-auto subtle-scroll leading-relaxed">
                  {template.content}
                </pre>
              </div>

              <div className="pt-2 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[10px] text-slate-500">بواسطة: {template.createdBy?.name || 'مدير النظام'}</span>

                <div className="flex items-center gap-2">
                  <button
                    data-testid="use-template"
                    onClick={() => openTemplateUsage(template)}
                    disabled={!template.isActive}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FilePlus2 className="w-3.5 h-3.5" /> استخدام القالب
                  </button>
                  {isManager && (
                    <>
                    <button
                      onClick={() => handleToggleActive(template)}
                      title={template.isActive ? 'تعطيل القالب' : 'تفعيل القالب'}
                      className={`p-1.5 rounded-lg border transition ${
                        template.isActive ? 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10' : 'text-slate-500 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setForm({
                          id: template.id,
                          title: template.title,
                          description: template.description || '',
                          practiceArea: template.practiceArea || 'LABOR',
                          templateType: template.templateType || 'DEMAND_LETTER',
                          content: template.content,
                          isActive: template.isActive,
                        });
                        setShowModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-300 border border-slate-800 hover:bg-slate-800 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1.5 rounded-lg text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating / Editing Template */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-2xl rounded-3xl border border-amber-500/20 p-6 shadow-2xl bg-slate-900 max-h-[90vh] overflow-y-auto subtle-scroll">
            <h2 className="text-base font-bold text-slate-100 mb-4 border-b border-slate-800 pb-3">
              {form.id ? 'تعديل قالب المشروع' : 'إضافة قالب مشروع جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان القالب *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="مثال: تقرير انحراف البرنامج الزمني"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">مجال المشروع *</label>
                  <select
                    value={form.practiceArea}
                    onChange={(e) => setForm({ ...form, practiceArea: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-500/50 cursor-pointer"
                  >
                    {PRACTICE_AREAS.map((area) => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نوع القالب *</label>
                  <select
                    value={form.templateType}
                    onChange={(e) => setForm({ ...form, templateType: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-500/50 cursor-pointer"
                  >
                    {TEMPLATE_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">وصف القالب (اختياري)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر للغرض من القالب وكيفية استخدامه..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نص القالب (يمكن استخدام المتغيرات مثل {"{{clientName}}"}) *</label>
                <textarea
                  rows={8}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="اكتب نص قالب المشروع واستخدم المتغيرات الذكية مثل {{clientName}} و {{caseNumber}}..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 outline-none focus:border-amber-500/50 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded border-slate-800 bg-slate-950"
                />
                <label htmlFor="isActiveCheck" className="text-xs text-slate-300 font-bold cursor-pointer">
                  تفعيل القالب للاستخدام بداخل المشاريع والمعاملات
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gold-gradient-bg text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{form.id ? 'حفظ التعديلات' : 'حفظ وإنشاء القالب'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {usageTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div data-testid="template-usage-modal" className="rusukh-dark-surface max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-emerald-500/25 bg-slate-950 p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white">إنشاء مسودة من القالب</h2>
                <p className="mt-1 text-xs text-slate-400">{usageTemplate.title}</p>
              </div>
              <button onClick={() => setUsageTemplate(null)} className="rounded-full border border-slate-800 p-2 text-slate-400 transition hover:text-white" aria-label="إغلاق">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateDocument} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">المشروع الذي ستُحفظ فيه المسودة *</label>
                <select
                  data-testid="template-project-select"
                  required
                  value={generationForm.matterId}
                  onChange={(e) => handleMatterSelection(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500/50"
                >
                  <option value="">-- اختر المشروع --</option>
                  {matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.title} — {matter.caseNumber || matter.id.substring(0, 8)}</option>)}
                </select>
                {matters.length === 0 && <p className="mt-2 text-xs text-amber-300">لا توجد مشاريع متاحة لهذا الحساب.</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">عنوان المستند</label>
                <input
                  value={generationForm.customTitle}
                  onChange={(e) => setGenerationForm((current) => ({ ...current, customTitle: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-slate-300">معاينة المسودة وتعديلها</label>
                  <span className="text-[10px] text-slate-500">يتم تعبئة بيانات المشروع تلقائياً بعد اختياره</span>
                </div>
                <textarea
                  data-testid="template-draft-content"
                  rows={13}
                  value={generationForm.editedContent}
                  onChange={(e) => setGenerationForm((current) => ({ ...current, editedContent: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs leading-7 text-slate-100 outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setUsageTemplate(null)} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-900">إلغاء</button>
                <button
                  data-testid="save-template-document"
                  type="submit"
                  disabled={!generationForm.matterId || isGenerating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                  حفظ المسودة في ملفات المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
