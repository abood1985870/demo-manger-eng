import { expect, test } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100';

test('office manager can toggle CREATE_CASE for a lawyer in the users page', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@firm.com');
  await page.fill('input[type="password"]', 'password123');
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
  await page.goto('/users');
  const permission = page.getByLabel('CREATE_CASE lawyer@firm.com');
  const initial = await permission.isChecked();
  const update = page.waitForResponse((response) => response.url().includes('/permissions') && response.request().method() === 'PATCH');
  await permission.click();
  expect((await update).ok()).toBeTruthy();
  if (initial) await expect(permission).not.toBeChecked();
  else await expect(permission).toBeChecked();

  const restore = page.waitForResponse((response) => response.url().includes('/permissions') && response.request().method() === 'PATCH');
  await permission.click();
  expect((await restore).ok()).toBeTruthy();
});
