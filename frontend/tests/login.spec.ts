import { expect, test } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100';

test('seeded administrator can sign in without fake MFA prompt', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@firm.com');
  await page.fill('input[type="password"]', 'password123');
  const loginResponse = page.waitForResponse((response) => response.url().endsWith('/api/auth/login') && response.request().method() === 'POST');
  await page.locator('form button[type="submit"]').click();
  expect((await loginResponse).ok()).toBeTruthy();
  const session = (await page.context().cookies()).find((cookie) => cookie.name === 'auth-session');
  expect(session).toMatchObject({ httpOnly: true, sameSite: 'Strict', path: '/' });
  expect(session?.secure).toBeFalsy();
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
  await page.screenshot({ path: 'test-results/production-login-success.png', fullPage: true });
});
