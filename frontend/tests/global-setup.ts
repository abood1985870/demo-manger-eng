import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

export default async function globalSetup() {
  const frontendDir = resolve(__dirname, '..');
  const testEnv = {
    ...process.env,
    DATABASE_URL: 'file:./qa-clean.db',
    ALLOW_TEST_SEED: 'true',
  };

  // The QA database is disposable. Reset it for deterministic reruns so stale
  // projects, messages, or permissions cannot create duplicate UI matches.
  execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npx.cmd --no-install prisma migrate reset --force --skip-seed --skip-generate'], {
    cwd: frontendDir,
    env: testEnv,
    stdio: 'inherit',
  });

  execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm.cmd run prisma -- db seed'], {
    cwd: frontendDir,
    env: testEnv,
    stdio: 'inherit',
  });
}
