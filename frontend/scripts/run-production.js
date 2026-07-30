const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = process.cwd();

// Load .env file if available
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && val && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

// Fallback environment variables
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'file:./dev.db';
if (process.env.DATABASE_URL.startsWith('file:./')) {
  const databaseFile = process.env.DATABASE_URL.slice('file:./'.length);
  process.env.DATABASE_URL = `file:${path.join(rootDir, 'prisma', databaseFile).replace(/\\/g, '/')}`;
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'production-secret-key-replace-me-later') {
  console.error('JWT_SECRET is missing or still uses the insecure placeholder. Set a strong secret in .env before production startup.');
  process.exit(1);
}
const configuredStoragePath = process.env.DOCUMENT_STORAGE_PATH || './storage';
process.env.DOCUMENT_STORAGE_PATH = path.isAbsolute(configuredStoragePath)
  ? configuredStoragePath
  : path.resolve(rootDir, configuredStoragePath);

const standaloneDir = path.join(rootDir, '.next', 'standalone');

if (!fs.existsSync(path.join(standaloneDir, 'server.js'))) {
  console.error('Production build is missing. Run "npm run build" first.');
  process.exit(1);
}

function copyDirectorySync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Ensure static files are copied
const nextStaticSrc = path.join(rootDir, '.next', 'static');
const nextStaticDest = path.join(standaloneDir, '.next', 'static');
copyDirectorySync(nextStaticSrc, nextStaticDest);

const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
copyDirectorySync(publicSrc, publicDest);

console.log('====================================================');
console.log('  Rusukh Real Estate Development Platform');
console.log('  Server URL: http://127.0.0.1:3100');
console.log('  Press Ctrl+C to stop the server');
console.log('====================================================\n');

const serverProcess = spawn('node', ['server.js'], {
  cwd: standaloneDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || '3100',
    HOSTNAME: process.env.HOSTNAME || '127.0.0.1'
  }
});

serverProcess.on('close', (code) => {
  process.exit(code);
});
