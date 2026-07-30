const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const requireHashedPasswords = process.env.REQUIRE_HASHED_PASSWORDS === 'true';
  const [tenants, users, matters, messages, audits, foreignKeyViolations] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.matter.count(),
    prisma.matterMessage.count(),
    prisma.auditLog.count(),
    prisma.$queryRawUnsafe('PRAGMA foreign_key_check'),
  ]);
  const legacyPasswords = requireHashedPasswords
    ? await prisma.user.count({ where: { password: { not: { startsWith: 'scrypt:' } } } })
    : 0;

  console.log(JSON.stringify({
    tenants,
    users,
    matters,
    messages,
    audits,
    legacyPasswords,
    foreignKeyViolations: foreignKeyViolations.length,
  }, null, 2));

  if (foreignKeyViolations.length > 0 || legacyPasswords > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
