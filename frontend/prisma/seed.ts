import { PrismaClient } from '@prisma/client';
import passwordCore from '../lib/password-core.cjs';

const { hashPassword } = passwordCore;

const prisma = new PrismaClient();

if (process.env.ALLOW_TEST_SEED !== 'true') {
  throw new Error('Refusing to seed test accounts. Set ALLOW_TEST_SEED=true only for an isolated QA database.');
}

async function main() {
  // Clean up existing data
  await prisma.developmentProjectProfile.deleteMany();
  await prisma.matterAccess.deleteMany();
  await prisma.matterPayment.deleteMany();
  await prisma.matterFeeAgreement.deleteMany();
  await prisma.matterDeadline.deleteMany();
  await prisma.matterParty.deleteMany();
  await prisma.matterConflictCheck.deleteMany();
  await prisma.matterImportDraft.deleteMany();
  await prisma.documentTemplate.deleteMany();
  await prisma.matterStatusHistory.deleteMany();
  await prisma.knowledgeItem.deleteMany();
  await prisma.complianceCase.deleteMany();
  await prisma.portalShare.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.matterMessageMention.deleteMany();
  await prisma.matterMessage.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.document.deleteMany();
  await prisma.task.deleteMany();
  await prisma.hearing.deleteMany();
  await prisma.caseFolder.deleteMany();
  await prisma.matter.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Create the primary real-estate developer company (Tenant)
  const firm = await prisma.tenant.create({
    data: {
      name: 'شركة الأفق للتطوير العقاري',
      domain: 'alufuq-development.sa',
    },
  });

  // Create Users
  const admin = await prisma.user.create({
    data: {
      tenantId: firm.id,
      name: 'سلمان العتيبي — مدير التطوير',
      email: 'admin@firm.com',
      password: hashPassword('password123'),
      role: 'admin',
    },
  });

  await prisma.user.create({
    data: {
      tenantId: firm.id,
      name: 'QA System Administrator',
      email: 'system@platform.test',
      password: hashPassword('password123'),
      role: 'superadmin',
    },
  });

  const lawyer1 = await prisma.user.create({
    data: {
      tenantId: firm.id,
      name: 'أحمد القحطاني — مدير مشروع',
      email: 'lawyer@firm.com',
      password: hashPassword('password123'),
      role: 'lawyer',
    },
  });

  await prisma.user.create({
    data: {
      tenantId: firm.id,
      name: 'QA MFA User',
      email: 'mfa@firm.com',
      password: hashPassword('password123'),
      role: 'lawyer',
    },
  });

  // Create buyers / investment accounts
  const client1 = await prisma.client.create({
    data: {
      tenantId: firm.id,
      name: 'صندوق الأفق العقاري',
      email: 'fund@alufuq.sa',
      phone: '0501234567',
      type: 'corporate',
    }
  });

  const client2 = await prisma.client.create({
    data: {
      tenantId: firm.id,
      name: 'عبدالله السالم',
      email: 'abdullah@example.com',
      phone: '0559876543',
      type: 'individual',
    }
  });

  // Existing Matter records are used as development projects by the current
  // application layer. DevelopmentProjectProfile stores the domain-specific KPIs.
  const matter1 = await prisma.matter.create({
    data: {
      tenantId: firm.id,
      clientId: client1.id,
      title: 'واجهة الرياض',
      caseNumber: 'RUH-2026-01',
      status: 'IN_PROGRESS',
      lawyerId: lawyer1.id,
      dueDate: new Date('2027-12-15T00:00:00.000Z'),
    },
  });

  const matter2 = await prisma.matter.create({
    data: {
      tenantId: firm.id,
      clientId: client2.id,
      title: 'رُبى النخيل',
      caseNumber: 'RUH-2026-02',
      status: 'UNDER_REVIEW',
      lawyerId: lawyer1.id,
      dueDate: new Date('2028-06-30T00:00:00.000Z'),
    },
  });

  const matter3 = await prisma.matter.create({
    data: {
      tenantId: firm.id,
      clientId: client1.id,
      title: 'سرايا جدة',
      caseNumber: 'JED-2026-03',
      status: 'ON_HOLD',
      lawyerId: lawyer1.id,
      dueDate: new Date('2028-03-31T00:00:00.000Z'),
    },
  });

  await prisma.developmentProjectProfile.createMany({
    data: [
      {
        tenantId: firm.id,
        matterId: matter1.id,
        projectCode: 'RUH-2026-01',
        city: 'الرياض',
        region: 'منطقة الرياض',
        stage: 'FINISHING',
        plannedStart: new Date('2025-01-01T00:00:00.000Z'),
        plannedEnd: new Date('2027-12-15T00:00:00.000Z'),
        projectValue: 1450000000,
        budgetAtCompletion: 980000000,
        plannedValue: 705600000,
        earnedValue: 676200000,
        actualCost: 655000000,
        totalUnits: 420,
        soldUnits: 305,
        collectedAmount: 782000000,
        offPlanStatus: 'APPROVED',
        buildingPermitStatus: 'APPROVED',
        buildingCodeStatus: 'COMPLIANT',
        occupancyStatus: 'NOT_STARTED',
      },
      {
        tenantId: firm.id,
        matterId: matter2.id,
        projectCode: 'RUH-2026-02',
        city: 'الرياض',
        region: 'منطقة الرياض',
        stage: 'STRUCTURE',
        plannedStart: new Date('2025-08-01T00:00:00.000Z'),
        plannedEnd: new Date('2028-06-30T00:00:00.000Z'),
        projectValue: 1180000000,
        budgetAtCompletion: 790000000,
        plannedValue: 395000000,
        earnedValue: 355500000,
        actualCost: 382000000,
        totalUnits: 560,
        soldUnits: 260,
        collectedAmount: 442000000,
        offPlanStatus: 'APPROVED',
        buildingPermitStatus: 'IN_REVIEW',
        buildingCodeStatus: 'COMPLIANT',
        occupancyStatus: 'NOT_STARTED',
      },
      {
        tenantId: firm.id,
        matterId: matter3.id,
        projectCode: 'JED-2026-03',
        city: 'جدة',
        region: 'منطقة مكة المكرمة',
        stage: 'FOUNDATION',
        plannedStart: new Date('2025-11-01T00:00:00.000Z'),
        plannedEnd: new Date('2028-03-31T00:00:00.000Z'),
        projectValue: 650000000,
        budgetAtCompletion: 470000000,
        plannedValue: 141000000,
        earnedValue: 112800000,
        actualCost: 131000000,
        totalUnits: 280,
        soldUnits: 61,
        collectedAmount: 98000000,
        offPlanStatus: 'IN_REVIEW',
        buildingPermitStatus: 'APPROVED',
        buildingCodeStatus: 'IN_REVIEW',
        occupancyStatus: 'NOT_STARTED',
      },
    ],
  });

  // Create Invoices
  await prisma.invoice.create({
    data: {
      tenantId: firm.id,
      clientId: client1.id,
      matterId: matter1.id,
      amount: 15000,
      status: 'unpaid',
      dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // In 14 days
    }
  });

  await prisma.invoice.create({
    data: {
      tenantId: firm.id,
      clientId: client2.id,
      amount: 5000,
      status: 'paid',
    }
  });

  // Create Contracts
  await prisma.contract.create({
    data: {
      tenantId: firm.id,
      clientId: client1.id,
      title: 'عقد إدارة وتطوير المشروع',
      status: 'signed',
      content: 'اتفاقية إدارة وتطوير مشروع واجهة الرياض وفق نطاق الأعمال والميزانية المعتمدة.'
    }
  });

  // Create milestones / project appointments
  await prisma.hearing.create({
    data: {
      matterId: matter1.id,
      date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      title: 'اعتماد عينة التشطيبات',
      court: 'الموقع — مبنى المبيعات',
      summary: 'اجتماع اعتماد المواد والعينات قبل بدء التنفيذ الشامل.',
    },
  });

  // Create Tasks (المهام)
  await prisma.task.create({
    data: {
      matterId: matter1.id,
      userId: lawyer1.id,
      title: 'إغلاق ملاحظات الاستشاري على التشطيبات',
      isUrgent: true,
      dueDate: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // In 1 day
    },
  });

  await prisma.task.create({
    data: {
      matterId: matter2.id,
      userId: lawyer1.id,
      title: 'استكمال متطلبات رخصة البناء',
      isUrgent: false,
    },
  });

  const otherFirm = await prisma.tenant.create({
    data: {
      name: 'QA Secondary Firm',
      domain: 'secondary-development.example',
    },
  });

  const otherLawyer = await prisma.user.create({
    data: {
      tenantId: otherFirm.id,
      name: 'QA Secondary Lawyer',
      email: 'lawyer@secondary-firm.test',
      password: hashPassword('password123'),
      role: 'lawyer',
    },
  });

  const otherClient = await prisma.client.create({
    data: {
      tenantId: otherFirm.id,
      name: 'QA Secondary Client',
      type: 'individual',
    },
  });

  await prisma.matter.create({
    data: {
      tenantId: otherFirm.id,
      clientId: otherClient.id,
      title: 'QA Secondary Development Project',
      status: 'active',
      lawyerId: otherLawyer.id,
    },
  });

  console.log('Database has been seeded successfully with extended models! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
