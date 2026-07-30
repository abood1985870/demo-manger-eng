const { spawn, spawnSync } = require('node:child_process');
const { cpSync, existsSync, mkdirSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');
const server = path.join(standaloneDir, 'server.js');

if (!existsSync(server)) {
  console.error('Production standalone build is missing. Run npm run build first.');
  process.exit(1);
}

function copyRuntimeDirectory(source, destination) {
  if (!existsSync(source)) return;
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
}

copyRuntimeDirectory(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));
copyRuntimeDirectory(path.join(root, 'public'), path.join(standaloneDir, 'public'));

const databaseUrl = process.env.DATABASE_URL?.startsWith('file:./')
  ? `file:${path.join(root, 'prisma', process.env.DATABASE_URL.slice('file:./'.length)).replace(/\\/g, '/')}`
  : process.env.DATABASE_URL;
const child = spawn(process.execPath, [server], {
  cwd: standaloneDir,
  env: { ...process.env, DATABASE_URL: databaseUrl, PORT: process.env.PORT || '3100', HOSTNAME: '127.0.0.1', NODE_ENV: 'production' },
  stdio: 'inherit',
});

let stopping = false;

function stopServer(exitCode) {
  if (stopping) return;
  stopping = true;

  if (process.platform === 'win32') {
    spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `taskkill /PID ${child.pid} /T /F`], {
      stdio: 'ignore',
      windowsHide: true,
      timeout: 5000,
    });
  } else {
    child.kill('SIGTERM');
  }
  process.exit(exitCode);
}

child.on('exit', (code) => {
  if (!stopping) process.exit(code ?? 1);
});
process.once('SIGTERM', () => stopServer(0));
process.once('SIGINT', () => stopServer(0));
