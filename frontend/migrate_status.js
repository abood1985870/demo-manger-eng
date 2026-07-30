const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matters = await prisma.matter.findMany({
    where: {
      status: {
        notIn: ['NEW', 'DRAFT', 'UNDER_STUDY', 'IN_PROGRESS', 'WAITING_CLIENT', 'WAITING_EXTERNAL', 'UNDER_REVIEW', 'READY_TO_SUBMIT', 'SUBMITTED', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']
      }
    }
  });

  console.log(`Found ${matters.length} legacy matters to migrate.`);

  for (const matter of matters) {
    let newStatus = 'IN_PROGRESS';
    if (matter.status === 'active') newStatus = 'IN_PROGRESS';
    else if (matter.status === 'closed') newStatus = 'COMPLETED';
    else if (matter.status === 'archived') newStatus = 'ARCHIVED';
    else if (matter.status === 'pending') newStatus = 'ON_HOLD';
    
    await prisma.matter.update({
      where: { id: matter.id },
      data: { status: newStatus }
    });
    console.log(`Updated matter ${matter.id} from ${matter.status} to ${newStatus}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
