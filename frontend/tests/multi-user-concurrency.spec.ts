import { expect, test } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('password123');
  await page.locator('form button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/login$/);
}

test('manager and project manager keep independent sessions under concurrent use', async ({ browser }) => {
  const managerContext = await browser.newContext();
  const engineerContext = await browser.newContext();
  const managerPage = await managerContext.newPage();
  const engineerPage = await engineerContext.newPage();

  try {
    await Promise.all([
      signIn(managerPage, 'admin@firm.com'),
      signIn(engineerPage, 'lawyer@firm.com'),
    ]);

    await Promise.all([
      managerPage.goto('/matters'),
      engineerPage.goto('/my-cases'),
    ]);

    await expect(managerPage.getByRole('heading', { name: 'إدارة محفظة المشاريع' })).toBeVisible();
    await expect(engineerPage.getByRole('heading', { name: 'مساحة عمل مدير المشروع' })).toBeVisible();

    const [managerProfile, engineerProfile, managerMatters, engineerMatters] = await Promise.all([
      managerContext.request.get('/api/auth/profile'),
      engineerContext.request.get('/api/auth/profile'),
      managerContext.request.get('/api/lawyer/matters'),
      engineerContext.request.get('/api/lawyer/matters'),
    ]);

    expect(managerProfile.ok()).toBeTruthy();
    expect(engineerProfile.ok()).toBeTruthy();
    expect((await managerProfile.json()).email).toBe('admin@firm.com');
    expect((await engineerProfile.json()).email).toBe('lawyer@firm.com');
    expect(managerMatters.ok()).toBeTruthy();
    expect(engineerMatters.ok()).toBeTruthy();

    const concurrentReads = Array.from({ length: 8 }, (_, index) => (
      index % 2 === 0
        ? managerContext.request.get('/api/lawyer/dashboard')
        : engineerContext.request.get('/api/lawyer/matters')
    ));
    const responses = await Promise.all(concurrentReads);
    expect(responses.every((response) => response.ok())).toBeTruthy();

    await Promise.all([managerPage.reload(), engineerPage.reload()]);
    await expect(engineerPage).toHaveURL(/\/my-cases$/);
    await expect(engineerPage.getByRole('heading', { name: 'مساحة عمل مدير المشروع' })).toBeVisible();
    await expect(managerPage).toHaveURL(/\/matters$/);
  } finally {
    await Promise.all([managerContext.close(), engineerContext.close()]);
  }
});
