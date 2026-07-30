export const MATTER_STATUSES = [
  'DRAFT',
  'NEW',
  'UNDER_STUDY',
  'IN_PROGRESS',
  'WAITING_CLIENT',
  'WAITING_EXTERNAL',
  'UNDER_REVIEW',
  'READY_TO_SUBMIT',
  'SUBMITTED',
  'ON_HOLD',
  'COMPLETED',
  'ARCHIVED'
] as const;

export type MatterStatus = typeof MATTER_STATUSES[number];

export const MATTER_STATUS_ARABIC: Record<MatterStatus, string> = {
  DRAFT: 'قيد الإعداد',
  NEW: 'مبادرة جديدة',
  UNDER_STUDY: 'قيد دراسة الجدوى',
  IN_PROGRESS: 'نشط',
  WAITING_CLIENT: 'بانتظار قرار المالك',
  WAITING_EXTERNAL: 'بانتظار جهة خارجية',
  UNDER_REVIEW: 'قيد الاعتماد',
  READY_TO_SUBMIT: 'جاهز للطرح أو التقديم',
  SUBMITTED: 'مطروح أو مقدم',
  ON_HOLD: 'متوقف مؤقتاً',
  COMPLETED: 'مكتمل',
  ARCHIVED: 'مؤرشفة'
};

export const MATTER_STATUS_COLORS: Record<MatterStatus, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  NEW: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  UNDER_STUDY: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  IN_PROGRESS: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  WAITING_CLIENT: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  WAITING_EXTERNAL: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  UNDER_REVIEW: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  READY_TO_SUBMIT: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  SUBMITTED: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  ON_HOLD: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  ARCHIVED: { bg: 'bg-slate-800', text: 'text-slate-500', border: 'border-slate-700' }
};

export function isValidMatterStatus(status: any): status is MatterStatus {
  return MATTER_STATUSES.includes(status);
}
