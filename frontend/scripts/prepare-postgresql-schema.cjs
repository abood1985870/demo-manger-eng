const { copyFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const source = join(root, 'prisma', 'schema.postgresql.prisma');
const targetDirectory = join(root, 'prisma', 'postgresql');
const target = join(targetDirectory, 'schema.prisma');

mkdirSync(targetDirectory, { recursive: true });
copyFileSync(source, target);
