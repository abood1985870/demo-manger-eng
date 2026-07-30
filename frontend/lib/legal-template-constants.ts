export const PRACTICE_AREAS = [
  { id: 'LABOR', name: 'المخططات والتصميم' },
  { id: 'COMMERCIAL', name: 'العقود والمشتريات' },
  { id: 'REAL_ESTATE', name: 'التطوير العقاري' },
  { id: 'FAMILY', name: 'المبيعات وخدمة العملاء' },
  { id: 'EXECUTION', name: 'التنفيذ والإنشاء' },
  { id: 'CRIMINAL', name: 'الجودة والسلامة' },
  { id: 'ADMINISTRATIVE', name: 'التراخيص والامتثال' },
  { id: 'CONSULTATION', name: 'الدراسات والاستشارات' },
  { id: 'GENERAL', name: 'عام' },
] as const;

export type PracticeAreaId = typeof PRACTICE_AREAS[number]['id'];

export const PRACTICE_AREA_NAMES: Record<string, string> = {
  LABOR: 'المخططات والتصميم',
  COMMERCIAL: 'العقود والمشتريات',
  REAL_ESTATE: 'التطوير العقاري',
  FAMILY: 'المبيعات وخدمة العملاء',
  EXECUTION: 'التنفيذ والإنشاء',
  CRIMINAL: 'الجودة والسلامة',
  ADMINISTRATIVE: 'التراخيص والامتثال',
  CONSULTATION: 'الدراسات والاستشارات',
  GENERAL: 'عام',
};

export const TEMPLATE_TYPES = [
  { id: 'DEMAND_LETTER', name: 'خطاب رسمي' },
  { id: 'MEMO', name: 'موجز إداري' },
  { id: 'CASE_REPORT', name: 'تقرير مشروع' },
  { id: 'FEE_AGREEMENT', name: 'اتفاقية خدمات' },
  { id: 'SETTLEMENT', name: 'محضر اعتماد' },
  { id: 'NOTICE', name: 'إشعار' },
  { id: 'GENERAL', name: 'عام' },
] as const;

export type TemplateTypeId = typeof TEMPLATE_TYPES[number]['id'];

export const TEMPLATE_TYPE_NAMES: Record<string, string> = {
  DEMAND_LETTER: 'خطاب رسمي',
  MEMO: 'موجز إداري',
  CASE_REPORT: 'تقرير مشروع',
  FEE_AGREEMENT: 'اتفاقية خدمات',
  SETTLEMENT: 'محضر اعتماد',
  NOTICE: 'إشعار',
  GENERAL: 'عام',
};

export const TEMPLATE_VARIABLES = [
  { tag: '{{clientName}}', description: 'اسم العميل أو المستثمر' },
  { tag: '{{beneficiaryName}}', description: 'اسم الحساب أو الجهة المستفيدة' },
  { tag: '{{caseNumber}}', description: 'رقم المشروع / الملف' },
  { tag: '{{matterTitle}}', description: 'عنوان المشروع' },
  { tag: '{{courtName}}', description: 'الموقع / الجهة المختصة' },
  { tag: '{{opponentName}}', description: 'المورد / المقاول / الطرف الخارجي' },
  { tag: '{{lawyerName}}', description: 'اسم مدير المشروع المسؤول' },
  { tag: '{{companyName}}', description: 'اسم شركة التطوير العقاري (الشركة)' },
  { tag: '{{today}}', description: 'تاريخ اليوم الحالي' },
  { tag: '{{matterStatus}}', description: 'حالة المشروع الحالية' },
  { tag: '{{claimAmount}}', description: 'قيمة المشروع أو المبلغ' },
  { tag: '{{hearingDate}}', description: 'تاريخ الموعد أو المرحلة القادمة' },
] as const;
