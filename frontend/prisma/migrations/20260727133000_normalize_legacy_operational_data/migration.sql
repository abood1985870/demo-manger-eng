-- Normalize only exact legacy demo records from the former legal-office seed.
-- User-created records and differently named records are intentionally untouched.

UPDATE "Document"
SET "title" = 'اعتماد المخطط العام.pdf', "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'لائحة الدعوى الأساسية.pdf';

UPDATE "Document"
SET "title" = 'تقرير تقدم الأعمال.docx', "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'مرفق الأدلة.docx';

UPDATE "Task"
SET "title" = 'إغلاق ملاحظات الاستشاري على أعمال التشطيبات', "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'صياغة مذكرة الرد على الخصم';

UPDATE "Task"
SET "title" = 'استكمال متطلبات رخصة البناء', "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'تجهيز ملف الأدلة والمستندات';

UPDATE "Hearing"
SET
  "title" = 'اعتماد عينة التشطيبات',
  "court" = 'الموقع — مبنى المبيعات',
  "summary" = 'اجتماع اعتماد المواد والعينات قبل بدء التنفيذ الشامل.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "court" = 'المحكمة التجارية بالرياض'
  AND "summary" = 'جلسة تقديم مذكرات الرد';

UPDATE "Contract"
SET
  "title" = 'عقد إدارة وتطوير المشروع',
  "summary" = 'اتفاقية إدارة وتطوير المشروع وفق نطاق الأعمال والميزانية المعتمدة.',
  "content" = 'اتفاقية إدارة وتطوير المشروع وفق نطاق الأعمال والبرنامج الزمني والميزانية المعتمدة.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'اتفاقية أتعاب محاماة سنوية';

UPDATE "DocumentTemplate"
SET
  "title" = 'محضر اعتماد نطاق الأعمال',
  "description" = 'نموذج توثيق نطاق الأعمال المعتمد ومسؤوليات الأطراف.',
  "category" = 'OTHER',
  "practiceArea" = 'REAL_ESTATE',
  "templateType" = 'GENERAL',
  "content" = 'المشروع: {{matterTitle}}\nرقم المشروع: {{caseNumber}}\nتم اعتماد نطاق الأعمال والمسؤوليات والمخرجات الموضحة في هذا المحضر.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'خطاب مطالبة بمستحقات عمالية';

UPDATE "DocumentTemplate"
SET
  "title" = 'تقرير انحراف البرنامج الزمني',
  "description" = 'تقرير موجز لتوثيق الانحراف وأسبابه وخطة المعالجة.',
  "category" = 'CASE_STATUS_REPORT',
  "practiceArea" = 'REAL_ESTATE',
  "templateType" = 'CASE_REPORT',
  "content" = 'المشروع: {{matterTitle}}\nرقم المشروع: {{caseNumber}}\nالحالة الحالية: {{matterStatus}}\nالانحراف وأسبابه:\nخطة الإجراء التصحيحي:',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'مذكرة مطالبة برواتب متأخرة وفصل تعسفي';

UPDATE "DocumentTemplate"
SET
  "title" = 'مطالبة دفعة مستخلص مقاول',
  "description" = 'خطاب مطالبة بصرف مستخلص معتمد وفق العقد.',
  "category" = 'DEMAND_LETTER',
  "practiceArea" = 'REAL_ESTATE',
  "templateType" = 'DEMAND_LETTER',
  "content" = 'المشروع: {{matterTitle}}\nرقم المشروع: {{caseNumber}}\nنأمل صرف قيمة المستخلص المعتمد وفق شروط العقد والجدول المالي.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'خطاب مطالبة بسداد مديونية تجارية';

UPDATE "DocumentTemplate"
SET
  "title" = 'إشعار تعثر مورد أو مقاول',
  "description" = 'إشعار رسمي بتعثر التنفيذ وطلب خطة معالجة محددة المدة.',
  "category" = 'DEMAND_LETTER',
  "practiceArea" = 'REAL_ESTATE',
  "templateType" = 'NOTICE',
  "content" = 'المشروع: {{matterTitle}}\nرقم المشروع: {{caseNumber}}\nلوحظ تعثر في تنفيذ نطاق الأعمال، ونطلب تقديم خطة معالجة وبرنامج تعافٍ معتمد.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'إنذار قانوني قبل قيد المعاملة التجارية';

UPDATE "DocumentTemplate"
SET
  "title" = 'إشعار تسليم وحدة عقارية',
  "description" = 'إشعار جاهزية الوحدة وإجراءات الاستلام والملاحظات.',
  "category" = 'OTHER',
  "practiceArea" = 'REAL_ESTATE',
  "templateType" = 'NOTICE',
  "content" = 'المشروع: {{matterTitle}}\nرقم المشروع: {{caseNumber}}\nنفيدكم بجاهزية الوحدة لإجراءات المعاينة والاستلام وفق الموعد المحدد.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'خطاب مطالبة بإخلاء عقار ودفع الأجرة المتأخرة';

UPDATE "DocumentTemplate"
SET
  "title" = 'محضر اجتماع لجنة المشروع',
  "description" = 'قالب لتوثيق القرارات والمسؤوليات وتواريخ الإقفال.',
  "category" = 'INTERNAL_MEMO',
  "practiceArea" = 'REAL_ESTATE',
  "templateType" = 'MEMO',
  "content" = 'المشروع: {{matterTitle}}\nرقم المشروع: {{caseNumber}}\nالقرارات:\nالمسؤوليات:\nتواريخ الإقفال:',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'مذكرة دعوى نفقة وحضانة أسرية';

UPDATE "DocumentTemplate"
SET
  "title" = 'طلب إجراء تصحيحي بالموقع',
  "description" = 'طلب رسمي لمعالجة مخالفة جودة أو سلامة في الموقع.',
  "category" = 'OTHER',
  "practiceArea" = 'REAL_ESTATE',
  "templateType" = 'NOTICE',
  "content" = 'المشروع: {{matterTitle}}\nرقم المشروع: {{caseNumber}}\nيرجى تنفيذ الإجراء التصحيحي الموضح وإرفاق دليل الإقفال خلال المدة المحددة.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'مذكرة اعتراض على إجراء تنفيذ وتظلم';

UPDATE "Tenant"
SET "domain" = 'secondary-development.example', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'QA Secondary Firm' AND "domain" = 'secondary-law.example';

UPDATE "Matter"
SET "title" = 'QA Secondary Development Project', "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'QA Secondary Matter';
