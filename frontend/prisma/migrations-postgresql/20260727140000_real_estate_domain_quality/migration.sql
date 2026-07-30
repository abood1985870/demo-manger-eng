ALTER TABLE "DevelopmentProjectProfile"
ADD COLUMN "latentDefectsInsuranceStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED';

DELETE FROM "DocumentTemplate"
WHERE "title" IN (
  'خطاب مطالبة بمستحقات عمالية',
  'مذكرة مطالبة برواتب متأخرة وفصل تعسفي',
  'خطاب مطالبة بسداد مديونية تجارية',
  'إنذار قانوني قبل قيد المعاملة التجارية',
  'خطاب مطالبة بإخلاء عقار ودفع الأجرة المتأخرة',
  'مذكرة دعوى نفقة وحضانة أسرية',
  'مذكرة اعتراض على إجراء تنفيذ وتظلم'
);
