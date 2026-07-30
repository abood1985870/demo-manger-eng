const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../lib/password-core.cjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting password migration...');
  const users = await prisma.user.findMany();
  let migratedCount = 0;

  for (const user of users) {
    if (!user.password.startsWith('scrypt:')) {
      console.log(`Migrating password for user: ${user.email}`);
      const hashedPassword = hashPassword(user.password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      migratedCount++;
    }
  }

  console.log(`Password migration complete. Migrated ${migratedCount} users.`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
