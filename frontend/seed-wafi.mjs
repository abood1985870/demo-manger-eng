import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Wafi Integration Data...');

  // 1. Get properties
  const properties = await prisma.property.findMany();
  
  if (properties.length === 0) {
    console.log('No properties found. Run the professional seeder first.');
    return;
  }

  const banks = ['مصرف الراجحي', 'بنك الرياض', 'البنك الأهلي السعودي', 'بنك البلاد'];

  for (const property of properties) {
    // Determine if property needs an escrow account based on status
    if (property.status === 'UNDER_CONSTRUCTION' || property.status === 'PLANNING') {
      const bankName = banks[Math.floor(Math.random() * banks.length)];
      const accountNumber = `SA${Math.floor(10 + Math.random() * 90)}100000${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      
      const totalDeposits = Math.floor(10000000 + Math.random() * 90000000);
      const retainedBalance = totalDeposits * 0.15; // 15% retained
      const availableBalance = totalDeposits - retainedBalance;
      
      const escrowAccount = await prisma.wafiEscrowAccount.upsert({
        where: { propertyId: property.id },
        update: {},
        create: {
          tenantId: property.tenantId,
          propertyId: property.id,
          accountNumber,
          bankName,
          totalDeposits,
          availableBalance,
          retainedBalance,
          status: 'ACTIVE',
        },
      });

      console.log(`Created Escrow Account for ${property.name}: ${bankName}`);

      // Create progress reports
      const numReports = property.status === 'UNDER_CONSTRUCTION' ? 3 : 1;
      
      let baseProgress = 10;
      for (let i = 0; i < numReports; i++) {
        const reportDate = new Date();
        reportDate.setMonth(reportDate.getMonth() - (numReports - i));
        
        const progress = baseProgress + (i * 20) + Math.floor(Math.random() * 5);
        
        await prisma.wafiProgressReport.create({
          data: {
            tenantId: property.tenantId,
            propertyId: property.id,
            reportDate,
            engineeringConsultant: 'مكتب خطيب وعلمي للاستشارات الهندسية',
            approvedProgressPercentage: Math.min(progress, 100),
            status: i === numReports - 1 ? 'PENDING' : 'APPROVED',
          },
        });
      }
    }
  }

  console.log('Wafi Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
