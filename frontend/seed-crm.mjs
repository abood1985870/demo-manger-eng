import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CRM Data...');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('No tenant found. Run professional seeder first.');
    return;
  }

  const properties = await prisma.property.findMany({ take: 2 });
  if (properties.length === 0) return;

  const leads = [
    { name: 'محمد الدوسري', phone: '0501112223', budget: 1500000, status: 'NEW' },
    { name: 'خالد العتيبي', phone: '0501112224', budget: 3000000, status: 'CONTACTED' },
    { name: 'سارة القحطاني', phone: '0501112225', budget: 850000, status: 'VIEWING' },
    { name: 'فيصل الغامدي', phone: '0501112226', budget: 4200000, status: 'NEGOTIATION' },
    { name: 'نورة السبيعي', phone: '0501112227', budget: 1200000, status: 'NEW' },
    { name: 'شركة أفق للتطوير', phone: '0501112228', budget: 15000000, status: 'NEGOTIATION' },
    { name: 'عبدالعزيز الشمري', phone: '0501112229', budget: 2500000, status: 'WON' },
    { name: 'سلمان المطيري', phone: '0501112230', budget: 600000, status: 'LOST' }
  ];

  for (let i = 0; i < leads.length; i++) {
    const propertyId = properties[i % properties.length].id;
    await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        interestedPropertyId: propertyId,
        ...leads[i],
      }
    });
  }

  console.log('CRM Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
