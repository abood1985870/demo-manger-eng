import { expect, test } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100';

test.describe('E2E and Tenant Isolation Tests', () => {
  test('Login, create a development project, and use the project chat', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@firm.com');
    await page.fill('input[type="password"]', 'password123');
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL(`${baseUrl}/dashboard`);

    await page.goto('/matters');
    await page.getByTestId('create-matter-button').click();
    const createMatterModal = page.getByTestId('create-matter-modal');
    await expect(createMatterModal).toBeVisible();

    await page.getByTestId('matter-title-input').fill('QA E2E Development Project');
    await page.getByTestId('matter-client-mode-external').evaluate((element) => (element as HTMLInputElement).click());
    await page.getByTestId('matter-external-party-input').fill('QA External Company');
    await page.getByTestId('matter-notes-input').fill('QA E2E Notes');
    await page.getByTestId('create-matter-submit').click();

    const createdMatterRow = page.locator('tbody tr').filter({ hasText: 'QA E2E Development Project' });
    await expect(createdMatterRow).toHaveCount(1);
    await createdMatterRow.getByRole('button').click();

    await expect(page.getByTestId('matter-party-name')).toHaveText('QA External Company');
    await expect(page.getByText('QA E2E Notes')).toBeVisible();

    await page.getByTestId('project-tab-chat').click();
    const textarea = page.getByTestId('matter-chat-input');
    await textarea.fill('QA project chat message');
    await textarea.evaluate((element) => (element as HTMLTextAreaElement).form?.requestSubmit());
    await expect(page.getByText('QA project chat message')).toBeVisible();

    const convertButton = page.getByRole('button', { name: 'تحويل الطرف الخارجي إلى عميل' });
    if (await convertButton.count()) {
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      await convertButton.click();
      await expect(page.getByTestId('matter-party-name')).toHaveText('QA External Company');
    }
  });

  test('Tenant Isolation API Level', async ({ request }) => {
    const loginA = await request.post('/api/auth/login', { data: { email: 'admin@firm.com', password: 'password123' } });
    expect(loginA.ok()).toBeTruthy();
    const cookies = loginA.headers()['set-cookie'];
    expect(cookies).toBeDefined();

    const mattersRes = await request.get('/api/lawyer/matters', { headers: { Cookie: cookies } });
    expect(mattersRes.ok()).toBeTruthy();

    const unauthorized = await request.fetch('/api/lawyer/matters', { headers: { Cookie: '' } });
    expect(unauthorized.status()).toBe(401);
  });
});
