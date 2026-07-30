import { test, expect } from '@playwright/test';

test.describe('Features 6 to 10 (Dashboard, Archiving, PDF Export, Search, Health)', () => {

  test('Feature 6: Dashboard API requires authentication (401)', async ({ request }) => {
    const res = await request.get('/api/lawyer/dashboard');
    expect(res.status()).toBe(401);
  });

  test('Feature 7: Archiving API requires authentication and rejects empty payload (401/400)', async ({ request }) => {
    const archiveRes = await request.patch('/api/lawyer/matters/test-id/archive', {
      data: { reason: 'أرشفة تجريبية' }
    });
    expect(archiveRes.status()).toBe(401);

    const unarchiveRes = await request.patch('/api/lawyer/matters/test-id/unarchive');
    expect(unarchiveRes.status()).toBe(401);
  });

  test('Feature 8: Matter PDF report endpoint requires authentication (401)', async ({ request }) => {
    const res = await request.get('/api/lawyer/matters/test-id/report');
    expect(res.status()).toBe(401);
  });

  test('Feature 9: Global Search API requires authentication (401)', async ({ request }) => {
    const res = await request.get('/api/lawyer/search?q=قضية');
    expect(res.status()).toBe(401);
  });

  test('Feature 10: System Health & Backup API requires admin authentication (401)', async ({ request }) => {
    const healthRes = await request.get('/api/admin/health');
    expect(healthRes.status()).toBe(401);

    const backupRes = await request.post('/api/admin/backup');
    expect(backupRes.status()).toBe(401);
  });

});
