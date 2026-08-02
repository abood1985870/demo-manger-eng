import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Client Portal Data...');

  // Get a tenant
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('No tenant found. Run professional seeder first.');
    return;
  }

  // Find properties
  const properties = await prisma.property.findMany({
    include: { units: true }
  });

  // Create a VIP Client
  let vipClient = await prisma.client.findFirst({ where: { name: 'عبدالله الراجحي (مستثمر VIP)' } });
  if (!vipClient) {
    vipClient = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: 'عبدالله الراجحي (مستثمر VIP)',
        email: 'investor@example.com',
        phone: '0500000001',
        type: 'investor',
        status: 'active',
      }
    });
  }

  console.log('VIP Client Created:', vipClient.name);

  // Buy some units for this VIP client
  let assignedCount = 0;
  for (const property of properties) {
    const availableUnits = property.units.filter(u => u.status === 'SOLD' && !u.buyerId);
    
    // Assign 2 sold units from each property to this VIP client
    for (let i = 0; i < Math.min(2, availableUnits.length); i++) {
      await prisma.unit.update({
        where: { id: availableUnits[i].id },
        data: {
          buyerId: vipClient.id
        }
      });
      assignedCount++;
    }
  }

  console.log(`Assigned ${assignedCount} units to VIP Client.`);
  
  // Create Invoices for the VIP client
  await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      clientId: vipClient.id,
      amount: 1500000,
      status: 'paid',
      dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      clientId: vipClient.id,
      amount: 750000,
      status: 'unpaid',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
    }
  });

  console.log('Invoices created for VIP Client.');
  console.log('Client Portal Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
