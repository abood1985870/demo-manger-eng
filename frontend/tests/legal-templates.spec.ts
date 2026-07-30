import { test, expect } from '@playwright/test';

test.describe('Legal Document Templates Library by Practice Area', () => {

  test('Unauthenticated access to templates API returns 401', async ({ request }) => {
    const res = await request.get('/api/lawyer/templates');
    expect(res.status()).toBe(401);
  });

  test('Creating template without authentication returns 401', async ({ request }) => {
    const res = await request.post('/api/lawyer/templates', {
      data: { title: 'قالب تجريبي', content: 'محتوى {{clientName}}' }
    });
    expect(res.status()).toBe(401);
  });

  test('Updating template without authentication returns 401', async ({ request }) => {
    const res = await request.patch('/api/lawyer/templates/test-id', {
      data: { title: 'تعديل العنوان' }
    });
    expect(res.status()).toBe(401);
  });

  test('Deleting template without authentication returns 401', async ({ request }) => {
    const res = await request.delete('/api/lawyer/templates/test-id');
    expect(res.status()).toBe(401);
  });

  test('Getting matter templates without authentication returns 401', async ({ request }) => {
    const res = await request.get('/api/lawyer/matters/test-id/templates');
    expect(res.status()).toBe(401);
  });

  test('Generating document from template without authentication returns 401', async ({ request }) => {
    const res = await request.post('/api/lawyer/matters/test-id/generate-document', {
      data: { templateId: 'test-template-id' }
    });
    expect(res.status()).toBe(401);
  });

});
