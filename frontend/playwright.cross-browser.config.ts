import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/cross-browser',
  globalSetup: require.resolve('./tests/global-setup.ts'),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'Google Chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    // Firefox's Windows software compositor can stall in headless desktop sessions.
    { name: 'Firefox', use: { ...devices['Desktop Firefox'], headless: false } },
    { name: 'WebKit', use: { ...devices['Desktop Safari'] } },
  ],
});
