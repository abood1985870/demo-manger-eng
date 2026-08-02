import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('No tenant found. Run default seed first.');
    return;
  }

  console.log(`Seeding Contract Templates for Tenant: ${tenant.name}`);

  const templates = [
    {
      name: 'عقد بيع وحدة عقارية على الخارطة (نموذج وافي)',
      content: `
# عقد بيع وحدة عقارية على الخارطة
**تاريخ العقد:** {{date}}

تم الاتفاق بين كل من:
1. **الطرف الأول (البائع/المطور):** شركة رُسوخ للتطوير العقاري
2. **الطرف الثاني (المشتري):** {{buyer_name}}

### المادة الأولى: موضوع العقد
باع الطرف الأول للطرف الثاني الوحدة العقارية رقم **{{unit_number}}** في مشروع **{{property_name}}**.
مساحة الوحدة: **{{unit_area}} م²**.

### المادة الثانية: الثمن والدفع
اتفق الطرفان على أن قيمة الوحدة هي **{{unit_price}} ريـال سعودي**.
يتم إيداع الدفعات في حساب الضمان رقم: **{{wafi_account}}**.

### المادة الثالثة: التسليم
يلتزم الطرف الأول بتسليم الوحدة في الموعد المحدد بناءً على تقارير الاستشاري الهندسي المعتمد.

*هذا العقد إلكتروني معتمد وجاهز للتوقيع.*
      `,
    },
    {
      name: 'عقد مبايعة أرض سكنية',
      content: `
# عقد مبايعة أرض سكنية
**تاريخ العقد:** {{date}}

تم الاتفاق بين كل من:
1. **الطرف الأول (البائع/المطور):** شركة رُسوخ للتطوير العقاري
2. **الطرف الثاني (المشتري):** {{buyer_name}}

### المادة الأولى: موضوع العقد
باع الطرف الأول للطرف الثاني قطعة الأرض رقم **{{unit_number}}** في مخطط **{{property_name}}**.
مساحة الأرض: **{{unit_area}} م²**.

### المادة الثانية: الثمن والدفع
اتفق الطرفان على أن قيمة الأرض هي **{{unit_price}} ريـال سعودي** تدفع نقداً عند توقيع العقد.

*هذا العقد إلكتروني معتمد وجاهز للتوقيع.*
      `,
    }
  ];

  for (const t of templates) {
    await prisma.contractTemplate.create({
      data: {
        tenantId: tenant.id,
        name: t.name,
        content: t.content,
      }
    });
  }

  console.log('✅ Contract templates seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
