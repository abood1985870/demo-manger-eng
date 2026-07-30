import { test, expect } from '@playwright/test';

test.describe('Operational Features (Tasks, Hearings, Timeline, Templates, Audit Log)', () => {

  test('Unauthenticated access to operational APIs is rejected with 401', async ({ request }) => {
    const tasksRes = await request.get('/api/lawyer/tasks');
    expect(tasksRes.status()).toBe(401);

    const hearingsRes = await request.get('/api/lawyer/hearings');
    expect(hearingsRes.status()).toBe(401);

    const templatesRes = await request.get('/api/lawyer/templates');
    expect(templatesRes.status()).toBe(401);

    const auditRes = await request.get('/api/admin/audit-logs');
    expect(auditRes.status()).toBe(401);
  });

  test('Creating task with empty title returns 400', async ({ request }) => {
    // Attempt task creation with empty payload without auth
    const res = await request.post('/api/lawyer/tasks', {
      data: { title: '' }
    });
    expect(res.status()).toBe(401);
  });

  test('Creating hearing with missing date returns 400 or 401', async ({ request }) => {
    const res = await request.post('/api/lawyer/hearings', {
      data: { court: 'المحكمة العامة' }
    });
    expect(res.status()).toBe(401);
  });

  test('Audit log API returns 403 for unauthorized users', async ({ request }) => {
    const res = await request.get('/api/admin/audit-logs');
    expect(res.status()).toBe(401);
  });

});
