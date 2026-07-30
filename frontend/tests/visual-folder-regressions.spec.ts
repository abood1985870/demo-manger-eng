import { expect, test } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('password123');
  await page.locator('form button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/login$/);
}

test('matter list and details return and display the assigned folder', async ({ page }) => {
  await signIn(page, 'admin@firm.com');
  const folderName = `محفظة اختبار ${Date.now()}`;
  let matterId = '';
  let folderId = '';

  try {
    const mattersResponse = await page.request.get('/api/lawyer/matters');
    expect(mattersResponse.ok()).toBeTruthy();
    const matter = (await mattersResponse.json())[0];
    expect(matter).toBeDefined();
    matterId = matter.id;

    const folderResponse = await page.request.post('/api/lawyer/folders', {
      data: { name: folderName, viewerIds: [] },
    });
    expect(folderResponse.status()).toBe(201);
    folderId = (await folderResponse.json()).id;

    const assignmentResponse = await page.request.patch(`/api/lawyer/matters/${matterId}/folder`, {
      data: { folderId },
    });
    expect(assignmentResponse.ok()).toBeTruthy();

    const listResponse = await page.request.get('/api/lawyer/matters');
    const assignedMatter = (await listResponse.json()).find((item: { id: string }) => item.id === matterId);
    expect(assignedMatter.folder).toMatchObject({ id: folderId, name: folderName });

    const detailResponse = await page.request.get(`/api/lawyer/matters/${matterId}`);
    expect((await detailResponse.json()).folder).toMatchObject({ id: folderId, name: folderName });

    await page.goto('/matters');
    const row = page.locator('tbody tr').filter({ hasText: matter.title });
    await expect(row.getByText(folderName)).toBeVisible();
    await row.getByRole('button', { name: 'التفاصيل' }).click();

    const modal = page.getByTestId('matter-details-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText(folderName)).toBeVisible();
    expect(await modal.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(2, 6, 23)');
  } finally {
    if (matterId) {
      await page.request.patch(`/api/lawyer/matters/${matterId}/folder`, { data: { folderId: 'none' } });
    }
    if (folderId) {
      await page.request.delete(`/api/lawyer/folders/${folderId}`);
    }
  }
});

test('project manager workspace keeps readable dark colors on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, 'lawyer@firm.com');
  await page.goto('/my-cases');

  const heading = page.getByRole('heading', { name: 'مساحة عمل مدير المشروع' });
  await expect(heading).toBeVisible();
  await expect(page.getByText(/مهام مفتوحة/)).toBeVisible();

  const workspace = page.getByTestId('project-manager-workspace');
  expect(await workspace.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(15, 23, 42)');
  expect(await heading.evaluate((element) => getComputedStyle(element).color)).toBe('rgb(255, 255, 255)');
});
