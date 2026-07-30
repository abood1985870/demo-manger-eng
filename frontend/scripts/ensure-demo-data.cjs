const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...parts] = trimmed.split('=');
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = parts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'file:./dev.db';
if (process.env.DATABASE_URL.startsWith('file:./')) {
  const databaseFile = process.env.DATABASE_URL.slice('file:./'.length);
  process.env.DATABASE_URL = `file:${path.join(rootDir, 'prisma', databaseFile).replace(/\\/g, '/')}`;
}

const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../lib/password-core.cjs');
const prisma = new PrismaClient();

const DEMO_PASSWORD = '12345678';
const DEMO_DOMAIN = 'rusukh-demo.local';
const DEMO_ENGINEER_PERMISSIONS = JSON.stringify({
  dashboard: true,
  projects: true,
  timeline: true,
  billing: true,
  clients: true,
  compliance: true,
  contracts: true,
  documents: true,
  team: false,
  reports: true,
  settings: true,
});

async function ensureFirst(model, where, create, update = create) {
  const existing = await model.findFirst({ where });
  return existing
    ? model.update({ where: { id: existing.id }, data: update })
    : model.create({ data: create });
}

async function main() {
  const tenant = await ensureFirst(
    prisma.tenant,
    { domain: DEMO_DOMAIN },
    { name: 'شركة رُسوخ للتطوير العقاري — بيئة العرض', domain: DEMO_DOMAIN },
    { name: 'شركة رُسوخ للتطوير العقاري — بيئة العرض', subscriptionStatus: 'active' },
  );

  const sharedPassword = hashPassword(DEMO_PASSWORD);
  const manager = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      tenantId: tenant.id,
      name: 'أ. خالد العتيبي — مدير مكتب التطوير',
      password: sharedPassword,
      role: 'admin',
      canCreateCase: true,
      isActive: true,
      mustChangePassword: false,
      mfaEnabled: false,
      mfaSecret: null,
    },
    create: {
      tenantId: tenant.id,
      name: 'أ. خالد العتيبي — مدير مكتب التطوير',
      email: 'admin@gmail.com',
      password: sharedPassword,
      role: 'admin',
      canCreateCase: true,
      isActive: true,
    },
  });

  const engineer = await prisma.user.upsert({
    where: { email: 'eng@gmail.com' },
    update: {
      tenantId: tenant.id,
      name: 'م. أحمد القحطاني — مهندس ومدير مشاريع',
      password: sharedPassword,
      role: 'lawyer',
      canCreateCase: true,
      modulePermissions: DEMO_ENGINEER_PERMISSIONS,
      isActive: true,
      mustChangePassword: false,
      mfaEnabled: false,
      mfaSecret: null,
    },
    create: {
      tenantId: tenant.id,
      name: 'م. أحمد القحطاني — مهندس ومدير مشاريع',
      email: 'eng@gmail.com',
      password: sharedPassword,
      role: 'lawyer',
      canCreateCase: true,
      modulePermissions: DEMO_ENGINEER_PERMISSIONS,
      isActive: true,
    },
  });

  const portfolio = await ensureFirst(
    prisma.caseFolder,
    { tenantId: tenant.id, name: 'محفظة مشاريع الرياض 2026' },
    {
      tenantId: tenant.id,
      name: 'محفظة مشاريع الرياض 2026',
      createdById: manager.id,
      viewers: { connect: [{ id: engineer.id }] },
    },
    { createdById: manager.id, viewers: { set: [{ id: engineer.id }] } },
  );

  const fund = await ensureFirst(
    prisma.client,
    { tenantId: tenant.id, email: 'investments@rusukh-demo.sa' },
    {
      tenantId: tenant.id,
      name: 'صندوق رُسوخ العقاري',
      email: 'investments@rusukh-demo.sa',
      phone: '0112458800',
      type: 'corporate',
    },
    { name: 'صندوق رُسوخ العقاري', phone: '0112458800', type: 'corporate', status: 'active' },
  );
  const company = await ensureFirst(
    prisma.client,
    { tenantId: tenant.id, email: 'projects@mada-demo.sa' },
    {
      tenantId: tenant.id,
      name: 'شركة مدى للاستثمار العقاري',
      email: 'projects@mada-demo.sa',
      phone: '0501234567',
      type: 'corporate',
    },
    { name: 'شركة مدى للاستثمار العقاري', phone: '0501234567', type: 'corporate', status: 'active' },
  );
  const buyer = await ensureFirst(
    prisma.client,
    { tenantId: tenant.id, email: 'buyer.demo@example.com' },
    {
      tenantId: tenant.id,
      name: 'عبدالله السالم',
      email: 'buyer.demo@example.com',
      phone: '0559876543',
      type: 'individual',
    },
    { name: 'عبدالله السالم', phone: '0559876543', type: 'individual', status: 'active' },
  );

  const projectDefinitions = [
    {
      title: 'واحة النخيل السكنية',
      caseNumber: 'RUS-2026-001',
      status: 'IN_PROGRESS',
      clientId: fund.id,
      city: 'الرياض',
      region: 'منطقة الرياض',
      stage: 'FINISHING',
      dueDate: new Date('2027-12-15T00:00:00.000Z'),
      projectValue: 485000000,
      budgetAtCompletion: 355000000,
      plannedValue: 248500000,
      earnedValue: 236000000,
      actualCost: 229000000,
      totalUnits: 320,
      soldUnits: 224,
      collectedAmount: 176500000,
    },
    {
      title: 'برج أفق الأعمال',
      caseNumber: 'RUS-2026-002',
      status: 'UNDER_REVIEW',
      clientId: company.id,
      city: 'الرياض',
      region: 'منطقة الرياض',
      stage: 'STRUCTURE',
      dueDate: new Date('2028-06-30T00:00:00.000Z'),
      projectValue: 720000000,
      budgetAtCompletion: 520000000,
      plannedValue: 187000000,
      earnedValue: 171500000,
      actualCost: 179000000,
      totalUnits: 84,
      soldUnits: 39,
      collectedAmount: 126000000,
    },
    {
      title: 'مجمع سُرى متعدد الاستخدام',
      caseNumber: 'RUS-2026-003',
      status: 'NEW',
      clientId: buyer.id,
      city: 'جدة',
      region: 'منطقة مكة المكرمة',
      stage: 'DESIGN',
      dueDate: new Date('2029-03-31T00:00:00.000Z'),
      projectValue: 265000000,
      budgetAtCompletion: 198000000,
      plannedValue: 42000000,
      earnedValue: 37500000,
      actualCost: 34600000,
      totalUnits: 146,
      soldUnits: 18,
      collectedAmount: 21500000,
    },
  ];

  const projects = [];
  for (const definition of projectDefinitions) {
    const project = await ensureFirst(
      prisma.matter,
      { tenantId: tenant.id, caseNumber: definition.caseNumber },
      {
        tenantId: tenant.id,
        clientId: definition.clientId,
        beneficiaryAccountId: definition.clientId,
        folderId: portfolio.id,
        lawyerId: engineer.id,
        title: definition.title,
        caseNumber: definition.caseNumber,
        status: definition.status,
        dueDate: definition.dueDate,
        notes: 'بيانات تجريبية ثابتة للعرض على العملاء.',
        teamMembers: { connect: [{ id: manager.id }, { id: engineer.id }] },
      },
      {
        clientId: definition.clientId,
        beneficiaryAccountId: definition.clientId,
        folderId: portfolio.id,
        lawyerId: engineer.id,
        title: definition.title,
        status: definition.status,
        dueDate: definition.dueDate,
        notes: 'بيانات تجريبية ثابتة للعرض على العملاء.',
        teamMembers: { set: [{ id: manager.id }, { id: engineer.id }] },
      },
    );
    projects.push(project);

    await prisma.developmentProjectProfile.upsert({
      where: { matterId: project.id },
      update: {
        tenantId: tenant.id,
        projectCode: definition.caseNumber,
        city: definition.city,
        region: definition.region,
        stage: definition.stage,
        plannedEnd: definition.dueDate,
        projectValue: definition.projectValue,
        budgetAtCompletion: definition.budgetAtCompletion,
        plannedValue: definition.plannedValue,
        earnedValue: definition.earnedValue,
        actualCost: definition.actualCost,
        totalUnits: definition.totalUnits,
        soldUnits: definition.soldUnits,
        collectedAmount: definition.collectedAmount,
        offPlanStatus: 'APPROVED',
        buildingPermitStatus: 'APPROVED',
        buildingCodeStatus: 'COMPLIANT',
      },
      create: {
        tenantId: tenant.id,
        matterId: project.id,
        projectCode: definition.caseNumber,
        city: definition.city,
        region: definition.region,
        stage: definition.stage,
        plannedStart: new Date('2026-01-01T00:00:00.000Z'),
        plannedEnd: definition.dueDate,
        projectValue: definition.projectValue,
        budgetAtCompletion: definition.budgetAtCompletion,
        plannedValue: definition.plannedValue,
        earnedValue: definition.earnedValue,
        actualCost: definition.actualCost,
        totalUnits: definition.totalUnits,
        soldUnits: definition.soldUnits,
        collectedAmount: definition.collectedAmount,
        offPlanStatus: 'APPROVED',
        buildingPermitStatus: 'APPROVED',
        buildingCodeStatus: 'COMPLIANT',
      },
    });

    await prisma.matterAccess.upsert({
      where: { matterId_userId: { matterId: project.id, userId: engineer.id } },
      update: {
        accessRole: 'RESPONSIBLE_LAWYER',
        canView: true,
        canEdit: true,
        canManageDocuments: true,
        canManageTasks: true,
        canManageHearings: true,
        canViewFinancials: true,
      },
      create: {
        tenantId: tenant.id,
        matterId: project.id,
        userId: engineer.id,
        createdById: manager.id,
        accessRole: 'RESPONSIBLE_LAWYER',
        canView: true,
        canEdit: true,
        canManageDocuments: true,
        canManageTasks: true,
        canManageHearings: true,
        canViewFinancials: true,
      },
    });
  }

  const [p1, p2, p3] = projects;
  const taskDefinitions = [
    [p1, 'اعتماد عينات التشطيبات للوحدة النموذجية', 'HIGH', false, '2026-08-05'],
    [p1, 'مراجعة تقرير المقاول الأسبوعي', 'MEDIUM', false, '2026-08-02'],
    [p2, 'إغلاق ملاحظات المخططات الإنشائية', 'URGENT', true, '2026-07-30'],
    [p3, 'رفع حزمة التصميم للجهة المختصة', 'MEDIUM', false, '2026-08-12'],
  ];
  for (const [project, title, priority, isUrgent, dueDate] of taskDefinitions) {
    await ensureFirst(
      prisma.task,
      { tenantId: tenant.id, matterId: project.id, title },
      {
        tenantId: tenant.id,
        matterId: project.id,
        userId: engineer.id,
        title,
        description: 'مهمة تجريبية ضمن خطة المشروع.',
        priority,
        isUrgent,
        status: 'IN_PROGRESS',
        dueDate: new Date(`${dueDate}T09:00:00.000Z`),
      },
      { userId: engineer.id, priority, isUrgent, status: 'IN_PROGRESS', dueDate: new Date(`${dueDate}T09:00:00.000Z`) },
    );
  }

  const milestoneDefinitions = [
    [p1, 'اجتماع اعتماد مواد الواجهات', 'الموقع — مبنى المبيعات', '2026-08-04'],
    [p2, 'مراجعة تقدم الأعمال الإنشائية', 'المكتب الرئيسي', '2026-08-09'],
    [p3, 'ورشة اعتماد التصور المعماري', 'قاعة اجتماعات رُسوخ', '2026-08-14'],
  ];
  for (const [project, title, court, date] of milestoneDefinitions) {
    await ensureFirst(
      prisma.hearing,
      { tenantId: tenant.id, matterId: project.id, title },
      {
        tenantId: tenant.id,
        matterId: project.id,
        type: 'CLIENT_MEETING',
        title,
        court,
        date: new Date(`${date}T07:30:00.000Z`),
        summary: 'موعد تجريبي يوضح الجدول الزمني للمشروع.',
      },
      { court, date: new Date(`${date}T07:30:00.000Z`), status: 'upcoming' },
    );
  }

  const invoiceDefinitions = [
    [fund, p1, 850000, 'paid', '2026-07-15'],
    [fund, p1, 425000, 'unpaid', '2026-08-15'],
    [company, p2, 675000, 'paid', '2026-07-20'],
    [buyer, p3, 180000, 'unpaid', '2026-08-30'],
  ];
  for (const [client, project, amount, status, dueDate] of invoiceDefinitions) {
    await ensureFirst(
      prisma.invoice,
      { tenantId: tenant.id, matterId: project.id, clientId: client.id, amount },
      { tenantId: tenant.id, clientId: client.id, matterId: project.id, amount, status, dueDate: new Date(`${dueDate}T00:00:00.000Z`) },
      { status, dueDate: new Date(`${dueDate}T00:00:00.000Z`) },
    );
  }

  const contractDefinitions = [
    [fund, 'عقد إدارة تطوير مشروع واحة النخيل', 'signed'],
    [company, 'اتفاقية إدارة التصميم والإشراف — برج أفق', 'signed'],
    [buyer, 'مسودة اتفاقية تطوير مجمع سُرى', 'draft'],
  ];
  for (const [client, title, status] of contractDefinitions) {
    await ensureFirst(
      prisma.contract,
      { tenantId: tenant.id, title },
      {
        tenantId: tenant.id,
        clientId: client.id,
        title,
        summary: 'وثيقة تجريبية للعرض توضح دورة العقود والموافقات.',
        content: 'نموذج تجريبي غير ملزم أُعد لأغراض عرض منصة رُسوخ.',
        status,
      },
      { clientId: client.id, status },
    );
  }

  const templateDefinitions = [
    ['مسودة محضر اجتماع تقدم المشروع', 'MEETING_MINUTES', 'PROJECT_MANAGEMENT', 'محضر اجتماع مشروع {{matter_title}}\nالتاريخ: {{current_date}}\nالحضور:\nالقرارات:\nالإجراءات والمسؤوليات:'],
    ['مسودة تقرير حالة المشروع الشهري', 'CASE_REPORT', 'REAL_ESTATE', 'تقرير حالة {{matter_title}}\nالمرحلة الحالية:\nنسبة الإنجاز:\nالمخاطر والقرارات المطلوبة:\nالخطة للشهر القادم:'],
    ['مسودة خطاب اعتماد تغيير', 'NOTICE', 'REAL_ESTATE', 'السادة/ {{client_name}}\nالموضوع: اعتماد تغيير في مشروع {{matter_title}}\nنأمل مراجعة نطاق التغيير والأثر المالي والزمني واعتماده.'],
  ];
  for (const [title, templateType, practiceArea, content] of templateDefinitions) {
    await ensureFirst(
      prisma.documentTemplate,
      { tenantId: tenant.id, title },
      {
        tenantId: tenant.id,
        title,
        description: 'قالب تجريبي ثابت قابل للتخصيص.',
        category: 'OTHER',
        practiceArea,
        templateType,
        content,
        isActive: true,
        createdById: manager.id,
        updatedById: manager.id,
      },
      { description: 'قالب تجريبي ثابت قابل للتخصيص.', content, isActive: true, updatedById: manager.id },
    );
  }

  const storageRoot = path.resolve(rootDir, process.env.DOCUMENT_STORAGE_PATH || './storage');
  const tenantStorage = path.join(storageRoot, tenant.id);
  fs.mkdirSync(tenantStorage, { recursive: true });
  const documentDefinitions = [
    [p1, 'ميثاق مشروع واحة النخيل.doc', 'demo-project-charter.doc', '<h1>ميثاق مشروع واحة النخيل</h1><p>وثيقة تجريبية توضح نطاق المشروع وأهدافه وأصحاب المصلحة.</p>'],
    [p2, 'تقرير التقدم الشهري — برج أفق.doc', 'demo-monthly-report.doc', '<h1>تقرير التقدم الشهري</h1><p>تقرير تجريبي يتضمن الإنجاز والمخاطر والقرارات المطلوبة.</p>'],
    [p3, 'مسودة خطة إدارة المخاطر.doc', 'demo-risk-plan.doc', '<h1>خطة إدارة المخاطر</h1><p>مسودة تجريبية لتحديد المخاطر والاستجابات والمسؤوليات.</p>'],
  ];
  for (const [project, title, fileName, body] of documentDefinitions) {
    fs.writeFileSync(
      path.join(tenantStorage, fileName),
      `<html dir="rtl"><meta charset="utf-8"><body>${body}<p>للعرض فقط — منصة رُسوخ.</p></body></html>`,
      'utf8',
    );
    await ensureFirst(
      prisma.document,
      { matterId: project.id, title },
      { matterId: project.id, title, type: 'doc', fileUrl: `private:${tenant.id}/${fileName}` },
      { type: 'doc', fileUrl: `private:${tenant.id}/${fileName}` },
    );
  }

  await ensureFirst(
    prisma.complianceCase,
    { tenantId: tenant.id, title: 'متابعة رخصة البيع على الخارطة — واحة النخيل' },
    {
      tenantId: tenant.id,
      clientId: fund.id,
      title: 'متابعة رخصة البيع على الخارطة — واحة النخيل',
      caseType: 'WAFI',
      riskLevel: 'low',
      status: 'approved',
      details: 'سجل تجريبي مكتمل يوضح حالة الترخيص والامتثال.',
    },
    { riskLevel: 'low', status: 'approved' },
  );

  await ensureFirst(
    prisma.knowledgeItem,
    { tenantId: tenant.id, title: 'دليل تسليم المشروع للعميل' },
    {
      tenantId: tenant.id,
      createdById: manager.id,
      title: 'دليل تسليم المشروع للعميل',
      category: 'إدارة المشاريع',
      content: 'قائمة تحقق تجريبية تشمل الفحص النهائي، وثائق التشغيل والصيانة، الضمانات، ومحاضر التسليم.',
    },
    { createdById: manager.id, content: 'قائمة تحقق تجريبية تشمل الفحص النهائي، وثائق التشغيل والصيانة، الضمانات، ومحاضر التسليم.' },
  );

  const messageDefinitions = [
    [p1, manager, 'تم اعتماد ميزانية التشطيبات. نحتاج تحديث البرنامج التنفيذي قبل اجتماع المالك.'],
    [p1, engineer, 'تم التحديث، ونسبة الإنجاز الحالية 67% ولا يوجد تأثير على موعد التسليم المخطط.'],
    [p2, engineer, 'اكتملت مراجعة المخططات الإنشائية، وبقي إغلاق ملاحظتين مع الاستشاري.'],
  ];
  for (const [project, author, body] of messageDefinitions) {
    await ensureFirst(
      prisma.matterMessage,
      { tenantId: tenant.id, matterId: project.id, authorId: author.id, body },
      { tenantId: tenant.id, matterId: project.id, authorId: author.id, body },
      {},
    );
  }

  await ensureFirst(
    prisma.notification,
    { tenantId: tenant.id, userId: engineer.id, title: 'موعد قريب للمشروع' },
    {
      tenantId: tenant.id,
      userId: engineer.id,
      title: 'موعد قريب للمشروع',
      message: 'اجتماع اعتماد مواد الواجهات خلال هذا الأسبوع.',
      link: `/matters?matterId=${p1.id}`,
    },
    { message: 'اجتماع اعتماد مواد الواجهات خلال هذا الأسبوع.', link: `/matters?matterId=${p1.id}`, isRead: false },
  );

  console.log('Demo workspace is ready.');
  console.log('Office manager: admin@gmail.com / 12345678');
  console.log('Engineer:      eng@gmail.com / 12345678');
}

main()
  .catch((error) => {
    console.error('Failed to ensure demo data:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
