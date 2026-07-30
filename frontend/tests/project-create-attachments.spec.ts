import { expect, test } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('admin@firm.com');
  await page.locator('input[type="password"]').fill('password123');
  await page.locator('form button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/login$/);
}

test('a new project uploads multiple files and exposes authorized downloads', async ({ page }) => {
  await signIn(page);
  await page.goto('/matters');
  await page.getByTestId('create-matter-button').click();

  const projectTitle = `مشروع رفع الملفات ${Date.now()}`;
  await page.getByTestId('matter-title-input').fill(projectTitle);
  await page.getByTestId('matter-files-input').setInputFiles([
    {
      name: 'project-brief.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\nRusukh project brief'),
    },
    {
      name: 'project-budget.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('Rusukh project budget'),
    },
  ]);

  await expect(page.getByTestId('selected-project-files')).toContainText('project-brief.pdf');
  await expect(page.getByTestId('selected-project-files')).toContainText('project-budget.xlsx');

  const createdResponsePromise = page.waitForResponse((response) => (
    response.url().endsWith('/api/lawyer/matters') && response.request().method() === 'POST'
  ));
  const uploadResponsesPromise = Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/api/lawyer/documents') && response.request().method() === 'POST'),
    page.waitForResponse((response) => response.url().endsWith('/api/lawyer/documents') && response.request().method() === 'POST'),
  ]);
  await page.getByTestId('create-matter-submit').click();

  const createdResponse = await createdResponsePromise;
  expect(createdResponse.status()).toBe(201);
  const createdMatter = await createdResponse.json();
  const uploadResponses = await uploadResponsesPromise;
  expect(uploadResponses.every((response) => response.status() === 201)).toBeTruthy();

  const detailResponse = await page.request.get(`/api/lawyer/matters/${createdMatter.id}`);
  expect(detailResponse.ok()).toBeTruthy();
  const createdDetail = await detailResponse.json();
  expect(createdDetail.documents.map((document: { title: string }) => document.title)).toEqual(
    expect.arrayContaining(['project-brief.pdf', 'project-budget.xlsx']),
  );

  const pdfDocument = createdDetail.documents.find((document: { title: string }) => document.title === 'project-brief.pdf');
  const download = await page.request.get(`/api/lawyer/documents/${pdfDocument.id}/download`);
  expect(download.ok()).toBeTruthy();
  expect(download.headers()['content-disposition']).toContain('attachment');
  expect(await download.body()).toEqual(Buffer.from('%PDF-1.4\nRusukh project brief'));
});
