import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/playwright',
  globalSetup: require.resolve('./tests/global-setup.ts'),
  fullyParallel: false,
  // SQLite uses one shared QA database, so parallel workers would race on its state.
  workers: 1,
  retries: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
