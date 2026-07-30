const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync } = require('node:crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

async function main() {
  const email = process.env.INITIAL_SUPERADMIN_EMAIL;
  const password = process.env.INITIAL_SUPERADMIN_PASSWORD;
  const tenantId = process.env.INITIAL_SUPERADMIN_TENANT_ID;

  if (!email || !password || !tenantId) {
    throw new Error('Set INITIAL_SUPERADMIN_EMAIL, INITIAL_SUPERADMIN_PASSWORD, and INITIAL_SUPERADMIN_TENANT_ID.');
  }
  if (password.length < 12) throw new Error('INITIAL_SUPERADMIN_PASSWORD must be at least 12 characters.');

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
  if (!tenant) throw new Error('INITIAL_SUPERADMIN_TENANT_ID does not exist.');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.tenantId !== tenantId) {
    throw new Error('The email is already assigned to another tenant.');
  }

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: hashPassword(password), role: 'superadmin', isActive: true, mustChangePassword: true, sessionVersion: { increment: 1 } },
    });
    console.log('Superadmin account updated.');
    return;
  }

  await prisma.user.create({
    data: { tenantId, email, name: 'System Administrator', password: hashPassword(password), role: 'superadmin', isActive: true, mustChangePassword: true },
  });
  console.log('Superadmin account created.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
