import { expect, test } from '@playwright/test';

test('office manager controls module access for a project team member', async ({ page, request }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@firm.com');
  await page.fill('input[type="password"]', 'password123');
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/users');

  await page.getByTestId('manage-module-permissions-lawyer@firm.com').click();
  const modal = page.getByTestId('module-permissions-modal');
  await expect(modal).toBeVisible();
  await expect(modal.getByText('صلاحيات الوصول للأقسام')).toBeVisible();

  const billingPermission = modal.getByLabel('التكاليف والفواتير lawyer@firm.com');
  const initiallyEnabled = await billingPermission.isChecked();
  if (initiallyEnabled) {
    const response = page.waitForResponse((item) => item.url().includes('/permissions') && item.request().method() === 'PATCH');
    await billingPermission.click();
    expect((await response).ok()).toBeTruthy();
  }
  await expect(billingPermission).not.toBeChecked();

  const adminLogin = await request.post('/api/auth/login', { data: { email: 'admin@firm.com', password: 'password123' } });
  const adminHeaders = { Cookie: adminLogin.headers()['set-cookie']! };
  const users = await request.get('/api/admin/users', { headers: adminHeaders });
  const lawyer = (await users.json()).find((user: { email: string }) => user.email === 'lawyer@firm.com');

  const deniedLogin = await request.post('/api/auth/login', { data: { email: 'lawyer@firm.com', password: 'password123' } });
  const deniedHeaders = { Cookie: deniedLogin.headers()['set-cookie']! };
  expect((await request.get('/api/lawyer/invoices', { headers: deniedHeaders })).status()).toBe(401);
  expect((await request.get('/api/lawyer/matters', { headers: deniedHeaders })).ok()).toBeTruthy();

  const grant = await request.patch(`/api/admin/users/${lawyer.id}/permissions`, {
    headers: adminHeaders,
    data: { permission: 'MODULE_ACCESS', module: 'billing', enabled: true },
  });
  expect(grant.ok()).toBeTruthy();
  const allowedLogin = await request.post('/api/auth/login', { data: { email: 'lawyer@firm.com', password: 'password123' } });
  expect((await request.get('/api/lawyer/invoices', { headers: { Cookie: allowedLogin.headers()['set-cookie']! } })).ok()).toBeTruthy();

  await request.patch(`/api/admin/users/${lawyer.id}/permissions`, {
    headers: adminHeaders,
    data: { permission: 'MODULE_ACCESS', module: 'billing', enabled: initiallyEnabled },
  });
});
