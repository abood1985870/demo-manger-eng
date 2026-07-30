import { expect, test } from '@playwright/test';

test('health endpoint confirms the database is reachable', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', database: 'ok' });
});

test('production server serves the login screen', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'مرحباً بعودتك' })).toBeVisible();
});
