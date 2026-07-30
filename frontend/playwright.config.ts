import { defineConfig } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/playwright',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  globalSetup: require.resolve('./tests/global-setup.ts'),
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'on-first-retry', screenshot: 'only-on-failure', video: 'retain-on-failure' },
  webServer: {
    command: 'node tests/start-production-server.cjs',
    cwd: __dirname,
    env: {
      ...process.env,
      DATABASE_URL: 'file:./qa-clean.db',
      DOCUMENT_STORAGE_PATH: join(tmpdir(), 'legal-office-playwright-documents'),
      JWT_SECRET: 'playwright-only-secret-not-for-production',
      PORT: '3100',
      HOSTNAME: '127.0.0.1',
    },
    url: 'http://127.0.0.1:3100/login',
    reuseExistingServer: false,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
