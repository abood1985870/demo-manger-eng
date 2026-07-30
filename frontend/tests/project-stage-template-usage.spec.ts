import { expect, test } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('admin@firm.com');
  await page.locator('input[type="password"]').fill('password123');
  await page.locator('form button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/login$/);
}

test('project stage can be changed from project details and persists', async ({ page }) => {
  await signIn(page);
  const mattersResponse = await page.request.get('/api/lawyer/matters');
  const matter = (await mattersResponse.json())[0];
  const originalStage = matter.developmentProfile?.stage || 'PLANNING';
  const nextStage = originalStage === 'DESIGN' ? 'PERMITTING' : 'DESIGN';

  try {
    const update = await page.request.patch(`/api/lawyer/matters/${matter.id}`, {
      data: { stage: nextStage },
    });
    expect(update.ok()).toBeTruthy();
    expect((await update.json()).developmentProfile.stage).toBe(nextStage);

    const detail = await page.request.get(`/api/lawyer/matters/${matter.id}`);
    expect((await detail.json()).developmentProfile.stage).toBe(nextStage);

    await page.goto('/matters');
    const row = page.locator('tbody tr').filter({ hasText: matter.title });
    await row.getByRole('button', { name: 'التفاصيل' }).click();
    await page.getByRole('button', { name: 'تعديل' }).click();
    await expect(page.getByTestId('edit-project-stage')).toHaveValue(nextStage);
    await expect(page.getByTestId('edit-project-stage')).toContainText('التصميم');
  } finally {
    await page.request.patch(`/api/lawyer/matters/${matter.id}`, { data: { stage: originalStage } });
  }
});

test('template library creates an editable draft inside a selected project', async ({ page }) => {
  await signIn(page);
  const mattersResponse = await page.request.get('/api/lawyer/matters');
  const matter = (await mattersResponse.json())[0];
  let generatedDocumentId = '';

  try {
    await page.goto('/templates');
    const useButtons = page.getByTestId('use-template');
    await expect(useButtons.first()).toBeVisible();
    await useButtons.first().click();

    const modal = page.getByTestId('template-usage-modal');
    await expect(modal).toBeVisible();
    await modal.getByTestId('template-project-select').selectOption(matter.id);
    await expect(modal.getByTestId('template-draft-content')).not.toHaveValue('');
    await expect(modal.getByTestId('template-draft-content')).not.toHaveValue(/\{\{(?:client_name|matter_title|current_date)\}\}/);

    page.once('dialog', (dialog) => dialog.accept());
    const generatedResponsePromise = page.waitForResponse((response) => (
      response.url().endsWith(`/api/lawyer/matters/${matter.id}/generate-document`)
      && response.request().method() === 'POST'
    ));
    await modal.getByTestId('save-template-document').click();
    const generatedResponse = await generatedResponsePromise;
    expect(generatedResponse.ok()).toBeTruthy();
    generatedDocumentId = (await generatedResponse.json()).document.id;
  } finally {
    if (generatedDocumentId) {
      await page.request.delete(`/api/lawyer/documents?id=${generatedDocumentId}`);
    }
  }
});
