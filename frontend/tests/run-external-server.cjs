const { spawn, spawnSync } = require('child_process');
const { closeSync, existsSync, mkdirSync, openSync } = require('fs');
const { resolve } = require('path');
const http = require('http');
const net = require('net');

const frontendDir = resolve(__dirname, '..');
const playwrightBin = require.resolve('@playwright/test/cli');
const stdoutPath = resolve(frontendDir, 'test-results/manual-server/stdout.log');
const stderrPath = resolve(frontendDir, 'test-results/manual-server/stderr.log');
mkdirSync(resolve(frontendDir, 'test-results/manual-server'), { recursive: true });
const stdoutFd = openSync(stdoutPath, 'w');
const stderrFd = openSync(stderrPath, 'w');
const port = Number.parseInt(process.env.TEST_PORT || '3100', 10);
const env = {
  ...process.env,
  DATABASE_URL: 'file:./qa-clean.db',
  DOCUMENT_STORAGE_PATH: resolve(frontendDir, 'test-results', 'external-documents'),
  JWT_SECRET: 'playwright-only-secret-not-for-production',
  NODE_ENV: 'production',
  REQUIRE_SECURE_COOKIES: 'false',
  PORT: String(port),
  PLAYWRIGHT_BASE_URL: `http://127.0.0.1:${port}`,
};
const playwrightArgs = process.argv.slice(2);
const runCount = Number.parseInt(process.env.PLAYWRIGHT_RUNS || '1', 10);
const playwrightConfig = process.env.PLAYWRIGHT_CONFIG || 'playwright.external.config.ts';

console.log(`PLAYWRIGHT_BIN=${playwrightBin}`);
console.log(`STANDALONE_SERVER_EXISTS=${existsSync(resolve(frontendDir, '.next', 'standalone', 'server.js'))}`);

let child;

function ensurePortIsAvailable() {
  return new Promise((resolvePromise, reject) => {
    const probe = net.createServer();
    probe.once('error', () => reject(new Error(`Port ${port} is already in use. Stop the existing server before running external Playwright tests.`)));
    probe.listen(port, '127.0.0.1', () => probe.close(resolvePromise));
  });
}

function startServer() {
  child = spawn(process.execPath, ['tests/start-production-server.cjs'], {
    cwd: frontendDir,
    shell: false,
    windowsHide: true,
    env,
    stdio: ['ignore', stdoutFd, stderrFd],
  });
  child.on('error', (error) => console.error(`SERVER_ERROR=${error.stack || error}`));
  console.log(`PID=${child.pid}`);
}

function loginStatus() {
  return new Promise((done) => {
    const req = http.get(`http://127.0.0.1:${port}/login`, (res) => {
      res.resume();
      done(res.statusCode);
    });
    req.setTimeout(3000, () => { req.destroy(); done(0); });
    req.on('error', () => done(0));
  });
}

function stopServer() {
  if (child?.pid) spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
    shell: false,
    windowsHide: true,
    stdio: 'ignore',
    timeout: 5000,
  });
  closeSync(stdoutFd);
  closeSync(stderrFd);
}

async function main() {
  await ensurePortIsAvailable();
  startServer();
  const deadline = Date.now() + 60000;
  let status = 0;
  while (Date.now() < deadline && child.exitCode === null) {
    status = await loginStatus();
    if (status === 200) break;
    await new Promise((done) => setTimeout(done, 2000));
  }
  console.log(`LOGIN_STATUS=${status}`);
  if (status !== 200) {
    stopServer();
    console.log('SERVER_READY=false');
    process.exitCode = 1;
    return;
  }
  console.log('SERVER_READY=true');

  const results = [];
  for (let run = 1; run <= runCount; run += 1) {
    const result = spawnSync(process.execPath, [playwrightBin, 'test', `--config=${playwrightConfig}`, ...playwrightArgs], {
      cwd: frontendDir,
      shell: false,
      windowsHide: true,
      stdio: 'inherit',
      env,
    });
    results.push(`RUN_${run}=${result.status ?? 1}`);
  }
  results.forEach((line) => console.log(line));
  stopServer();
  process.exit(results.some((line) => !line.endsWith('=0')) ? 1 : 0);
}

main().catch((error) => { console.error(error.stack || error); stopServer(); process.exit(1); });
