import { test, expect } from '@playwright/test';

test.describe('5 Deep Operational Legal Features (Conflict Check, Parties, Deadlines, Financials, Access)', () => {

  test('Feature 1: Conflict Check API requires authentication (401)', async ({ request }) => {
    const res = await request.post('/api/lawyer/conflict-check', {
      data: { name: 'شركة الخصم التجاري' }
    });
    expect(res.status()).toBe(401);

    const ackRes = await request.post('/api/lawyer/conflict-check/acknowledge', {
      data: { checkId: 'test-id', overrideReason: 'تجاوز مصرح' }
    });
    expect(ackRes.status()).toBe(401);
  });

  test('Feature 2: Multiple Case Parties API requires authentication (401)', async ({ request }) => {
    const getRes = await request.get('/api/lawyer/matters/test-id/parties');
    expect(getRes.status()).toBe(401);

    const postRes = await request.post('/api/lawyer/matters/test-id/parties', {
      data: { name: 'طرف مدعى عليه متضامن', role: 'DEFENDANT' }
    });
    expect(postRes.status()).toBe(401);
  });

  test('Feature 3: Matter Deadlines API requires authentication (401)', async ({ request }) => {
    const getRes = await request.get('/api/lawyer/matters/test-id/deadlines');
    expect(getRes.status()).toBe(401);

    const postRes = await request.post('/api/lawyer/matters/test-id/deadlines', {
      data: { title: 'موعد استئناف', dueDate: new Date().toISOString() }
    });
    expect(postRes.status()).toBe(401);
  });

  test('Feature 4: Fees & Payments Financials API requires authentication (401)', async ({ request }) => {
    const getRes = await request.get('/api/lawyer/matters/test-id/financials');
    expect(getRes.status()).toBe(401);

    const setFeeRes = await request.post('/api/lawyer/matters/test-id/financials', {
      data: { totalFee: 50000 }
    });
    expect(setFeeRes.status()).toBe(401);

    const addPayRes = await request.post('/api/lawyer/matters/test-id/financials/payments', {
      data: { amount: 10000, method: 'BANK_TRANSFER' }
    });
    expect(addPayRes.status()).toBe(401);
  });

  test('Feature 5: Fine-grained Matter Access Control API requires authentication (401)', async ({ request }) => {
    const getRes = await request.get('/api/lawyer/matters/test-id/access');
    expect(getRes.status()).toBe(401);

    const postRes = await request.post('/api/lawyer/matters/test-id/access', {
      data: { userId: 'user-test-id', accessRole: 'ASSIGNED_LAWYER' }
    });
    expect(postRes.status()).toBe(401);
  });

});
