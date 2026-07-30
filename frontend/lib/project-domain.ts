export const PROJECT_STAGE_OPTIONS = [
  { value: 'PLANNING', label: 'التخطيط ودراسة الجدوى', group: 'PLANNING' },
  { value: 'ACQUISITION', label: 'الاستحواذ والأرض', group: 'ACQUISITION' },
  { value: 'DESIGN', label: 'التصميم', group: 'DESIGN' },
  { value: 'PERMITTING', label: 'التراخيص والاعتمادات', group: 'PERMITTING' },
  { value: 'PROCUREMENT', label: 'الطرح والتعاقد', group: 'PROCUREMENT' },
  { value: 'FOUNDATION', label: 'الأساسات', group: 'EXECUTION' },
  { value: 'STRUCTURE', label: 'الهيكل الإنشائي', group: 'EXECUTION' },
  { value: 'MEP', label: 'الأعمال الكهروميكانيكية', group: 'EXECUTION' },
  { value: 'FINISHING', label: 'التشطيبات', group: 'EXECUTION' },
  { value: 'SALES', label: 'المبيعات والتحصيل', group: 'SALES' },
  { value: 'HANDOVER', label: 'التسليم', group: 'HANDOVER' },
  { value: 'OPERATIONS', label: 'التشغيل وما بعد التسليم', group: 'OPERATIONS' },
] as const;

export const PROJECT_LIFECYCLE = [
  { id: 'PLANNING', label: 'التخطيط' },
  { id: 'ACQUISITION', label: 'الأرض' },
  { id: 'DESIGN', label: 'التصميم' },
  { id: 'PERMITTING', label: 'التراخيص' },
  { id: 'PROCUREMENT', label: 'الطرح والتعاقد' },
  { id: 'EXECUTION', label: 'التنفيذ' },
  { id: 'SALES', label: 'المبيعات' },
  { id: 'HANDOVER', label: 'التسليم والتشغيل' },
] as const;

export const COMPLIANCE_STATUS_OPTIONS = [
  { value: 'NOT_APPLICABLE', label: 'غير منطبق' },
  { value: 'NOT_STARTED', label: 'لم يبدأ' },
  { value: 'IN_PROGRESS', label: 'جارٍ الاستكمال' },
  { value: 'IN_REVIEW', label: 'قيد مراجعة الجهة' },
  { value: 'APPROVED', label: 'معتمد' },
  { value: 'COMPLIANT', label: 'مطابق' },
  { value: 'ISSUED', label: 'صادر' },
  { value: 'ACTION_REQUIRED', label: 'يتطلب إجراء' },
  { value: 'REJECTED', label: 'مرفوض' },
  { value: 'EXPIRED', label: 'منتهي الصلاحية' },
] as const;

export const COMPLIANCE_STATUS_LABELS = Object.fromEntries(
  COMPLIANCE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

export const PROJECT_COMPLIANCE_FIELDS = [
  {
    key: 'offPlanStatus',
    label: 'ترخيص البيع على الخارطة',
    shortLabel: 'البيع على الخارطة',
    description: 'قيد المطور، ترخيص المشروع، الإفصاح وحساب الضمان عند انطباق النشاط.',
  },
  {
    key: 'buildingPermitStatus',
    label: 'رخصة البناء',
    shortLabel: 'رخصة البناء',
    description: 'اعتماد المخططات والرخصة عبر المكتب الهندسي والجهات المختصة.',
  },
  {
    key: 'buildingCodeStatus',
    label: 'مطابقة كود البناء السعودي',
    shortLabel: 'كود البناء',
    description: 'متابعة المطابقة الفنية خلال التصميم والتنفيذ والتفتيش.',
  },
  {
    key: 'latentDefectsInsuranceStatus',
    label: 'تأمين العيوب الخفية',
    shortLabel: 'تأمين العيوب',
    description: 'توثيق وثيقة التأمين المطلوبة للمباني الواقعة ضمن نطاق الإلزام.',
  },
  {
    key: 'occupancyStatus',
    label: 'شهادة الإشغال',
    shortLabel: 'شهادة الإشغال',
    description: 'إقفال متطلبات اكتمال البناء والتفتيش وإصدار شهادة الإشغال.',
  },
] as const;

export type ProjectComplianceField = typeof PROJECT_COMPLIANCE_FIELDS[number]['key'];

export function getProjectStageGroup(stage?: string | null) {
  const match = PROJECT_STAGE_OPTIONS.find((option) => option.value === stage);
  if (match?.group === 'OPERATIONS') return 'HANDOVER';
  return match?.group || 'PLANNING';
}

export function getProjectStageLabel(stage?: string | null) {
  return PROJECT_STAGE_OPTIONS.find((option) => option.value === stage)?.label || 'غير محدد';
}

export function complianceTone(value?: string | null) {
  if (['APPROVED', 'COMPLIANT', 'ISSUED'].includes(value || '')) {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  }
  if (['REJECTED', 'EXPIRED', 'ACTION_REQUIRED'].includes(value || '')) {
    return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
  }
  if (value === 'NOT_APPLICABLE') {
    return 'border-slate-700 bg-slate-800/70 text-slate-400';
  }
  return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
}
