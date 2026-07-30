import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

const DEFAULT_SAMPLE_TEMPLATES = [
  {
    title: 'محضر اعتماد نطاق المشروع',
    description: 'محضر موحد لاعتماد أهداف المشروع ونطاقه ومخرجاته ومسؤوليات أصحاب المصلحة',
    practiceArea: 'LABOR',
    templateType: 'SETTLEMENT',
    content: `بسم الله الرحمن الرحيم

محضر اعتماد نطاق المشروع

اسم المشروع: {{matterTitle}}
رمز المشروع: {{caseNumber}}
المالك / المستثمر: {{clientName}}
شركة التطوير: {{companyName}}
مدير المشروع: {{lawyerName}}

تم في تاريخ {{today}} اعتماد نطاق المشروع وأهدافه ومخرجاته الرئيسية، على أن تُدار التغييرات اللاحقة من خلال سجل تغييرات معتمد يوضح الأثر على الوقت والتكلفة والجودة.

الاعتمادات:
المالك / المستثمر: __________________
مدير المشروع: __________________
الاستشاري: __________________`,
  },
  {
    title: 'تقرير حالة المشروع الشهري',
    description: 'تقرير تنفيذي موجز للحالة والإنجاز والتكلفة والمخاطر والقرارات المطلوبة',
    practiceArea: 'REAL_ESTATE',
    templateType: 'MEMO',
    content: `تقرير حالة المشروع الشهري

المشروع: {{matterTitle}} ({{caseNumber}})
الحالة: {{matterStatus}}
مدير المشروع: {{lawyerName}}
تاريخ التقرير: {{today}}

1. الملخص التنفيذي:
[اكتب ملخص الحالة العامة وأبرز التغيرات]

2. الإنجاز مقابل الخطة:
[النسبة المخططة / الفعلية / الانحراف]

3. التكلفة والتدفقات النقدية:
[الميزانية / المصروف / الالتزامات / التحصيل]

4. التراخيص والجودة والسلامة:
[الحالة والإجراءات المفتوحة]

5. المخاطر والقرارات المطلوبة:
[المخاطر، المالك، تاريخ الإقفال، القرار المطلوب]`,
  },
  {
    title: 'خطاب ترسية مقاول أو مورد',
    description: 'خطاب ترسية مبدئي يوضح النطاق والقيمة ومتطلبات ما قبل المباشرة',
    practiceArea: 'COMMERCIAL',
    templateType: 'DEMAND_LETTER',
    content: `السادة / {{opponentName}} المحترمين

الموضوع: إشعار ترسية أعمال مشروع {{matterTitle}}

تحية طيبة وبعد،،

نفيدكم باختيار عرضكم لتنفيذ نطاق الأعمال المتفق عليه للمشروع رقم {{caseNumber}}، بقيمة إجمالية قدرها {{claimAmount}} ريال، وذلك مشروطاً باستكمال الضمانات والتأمينات والبرنامج الزمني وخطة الجودة والسلامة قبل المباشرة.

يرجى تأكيد القبول وتقديم متطلبات التعاقد خلال المدة المحددة في وثائق الطرح.

شركة التطوير العقاري: {{companyName}}
مدير المشروع: {{lawyerName}}
التاريخ: {{today}}`,
  },
  {
    title: 'سجل طلب تغيير',
    description: 'نموذج لضبط التغييرات وقياس أثرها على الوقت والتكلفة والنطاق',
    practiceArea: 'EXECUTION',
    templateType: 'NOTICE',
    content: `طلب تغيير — مشروع {{matterTitle}}

رقم المشروع: {{caseNumber}}
تاريخ الطلب: {{today}}
مقدم الطلب: {{opponentName}}

وصف التغيير:
[الوصف والسبب]

الأثر المتوقع:
- النطاق: [ ]
- المدة: [ ] يوم
- التكلفة: [ ] ريال
- الجودة / السلامة / التراخيص: [ ]

توصية مدير المشروع {{lawyerName}}:
[اعتماد / رفض / طلب معلومات]

قرار المالك / المستثمر {{clientName}}:
[القرار والتاريخ]`,
  },
  {
    title: 'محضر اجتماع مشروع',
    description: 'محضر اجتماع يتضمن القرارات والإجراءات والمسؤوليات وتواريخ الإقفال',
    practiceArea: 'GENERAL',
    templateType: 'SETTLEMENT',
    content: `محضر اجتماع مشروع {{matterTitle}}

التاريخ: {{today}}
الموقع / الجهة: {{courtName}}
مدير الاجتماع: {{lawyerName}}

الحضور:
[الأسماء والجهات]

الموضوعات والقرارات:
1. [الموضوع] — القرار: [ ] — المسؤول: [ ] — الاستحقاق: [ ]
2. [الموضوع] — القرار: [ ] — المسؤول: [ ] — الاستحقاق: [ ]

الإجراءات المفتوحة:
[الإجراء / المالك / الموعد / الحالة]`,
  },
  {
    title: 'قائمة جاهزية التسليم',
    description: 'قائمة تحقق للتسليم والإقفال والتشغيل وخدمة ما بعد البيع',
    practiceArea: 'CRIMINAL',
    templateType: 'CASE_REPORT',
    content: `قائمة جاهزية تسليم مشروع {{matterTitle}}

رقم المشروع: {{caseNumber}}
التاريخ: {{today}}

□ اكتمال الأعمال والفحوصات
□ إقفال الملاحظات الجوهرية
□ اعتماد مخططات ما تم تنفيذه
□ تسليم كتيبات التشغيل والصيانة
□ إصدار شهادة الإشغال
□ تفعيل الضمانات والتأمينات
□ جاهزية ملفات الوحدات والعملاء
□ خطة إدارة العيوب وخدمة ما بعد التسليم

ملاحظات مدير المشروع {{lawyerName}}:
[الملاحظات]

قرار الجاهزية:
[جاهز / جاهز بشروط / غير جاهز]`,
  },
  {
    title: 'سجل متطلبات الترخيص والامتثال',
    description: 'قائمة متابعة للجهات والمتطلبات والمستندات وحالات الإقفال',
    practiceArea: 'ADMINISTRATIVE',
    templateType: 'CASE_REPORT',
    content: `سجل متطلبات الترخيص والامتثال

المشروع: {{matterTitle}} ({{caseNumber}})
الموقع / الجهة: {{courtName}}
تاريخ التحديث: {{today}}

المتطلب | الجهة | المسؤول | تاريخ التقديم | الحالة | الإجراء التالي
رخصة البناء | [ ] | [ ] | [ ] | [ ] | [ ]
كود البناء السعودي | [ ] | [ ] | [ ] | [ ] | [ ]
تأمين العيوب الخفية | [ ] | [ ] | [ ] | [ ] | [ ]
البيع على الخارطة (إن انطبق) | [ ] | [ ] | [ ] | [ ] | [ ]
شهادة الإشغال | [ ] | [ ] | [ ] | [ ] | [ ]`,
  }
];

export async function GET(request: Request) {
  try {
    const session = await getSession('documents');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const practiceArea = searchParams.get('practiceArea');
    const templateType = searchParams.get('templateType');
    const isActiveOnly = searchParams.get('isActive') === 'true';

    const where: any = {
      tenantId: session.tenantId,
    };

    if (practiceArea && practiceArea !== 'all') {
      where.practiceArea = practiceArea;
    }

    if (templateType && templateType !== 'all') {
      where.templateType = templateType;
    }

    if (isActiveOnly) {
      where.isActive = true;
    }

    let templates = await prisma.documentTemplate.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Seed sample templates for this tenant if total templates count is zero
    const totalCount = await prisma.documentTemplate.count({ where: { tenantId: session.tenantId } });
    if (totalCount === 0) {
      for (const t of DEFAULT_SAMPLE_TEMPLATES) {
        await prisma.documentTemplate.create({
          data: {
            tenantId: session.tenantId,
            title: t.title,
            description: t.description,
            practiceArea: t.practiceArea,
            templateType: t.templateType,
            category: t.templateType,
            content: t.content,
            isActive: true,
            createdById: session.userId,
          }
        });
      }

      templates = await prisma.documentTemplate.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
          updatedBy: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(templates);

  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب القوالب التطويرية.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession('documents');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    // Manager / Admin check
    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    if (!isManager) {
      return NextResponse.json({ error: 'صلاحية إضافة وتعطيل القوالب التطويرية تقتصر على مدير الشركة أو مسؤول النظام' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, practiceArea, templateType, content, isActive } = body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return NextResponse.json({ error: 'عنوان القالب ومحتواه مطلوبان' }, { status: 400 });
    }

    const template = await prisma.documentTemplate.create({
      data: {
        tenantId: session.tenantId,
        title: title.trim(),
        description: description || null,
        practiceArea: practiceArea || 'GENERAL',
        templateType: templateType || 'GENERAL',
        category: templateType || 'GENERAL',
        content,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        createdById: session.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } }
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'LEGAL_TEMPLATE_CREATE',
      entityType: 'DocumentTemplate',
      entityId: template.id,
      metadata: { title: template.title, practiceArea: template.practiceArea, templateType: template.templateType },
      req: request,
    });

    return NextResponse.json(template, { status: 201 });

  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة قالب المشروع.' }, { status: 500 });
  }
}
