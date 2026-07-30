import { expect, test } from '@playwright/test';
import { createTotp } from '../lib/mfa';

test('MFA setup enforces TOTP and never exposes the secret', async ({ request }) => {
  const adminLogin = await request.post('/api/auth/login', { data: { email: 'admin@firm.com', password: 'password123' } });
  expect(adminLogin.ok()).toBeTruthy();
  const adminCookie = adminLogin.headers()['set-cookie'];
  expect(adminCookie).toBeDefined();

  const usersResponse = await request.get('/api/admin/users', { headers: { Cookie: adminCookie } });
  expect(usersResponse.ok()).toBeTruthy();
  const target = (await usersResponse.json()).find((user: { email: string }) => user.email === 'mfa@firm.com');
  expect(target).toBeDefined();
  expect(target.mfaSecret).toBeUndefined();

  const setup = await request.post(`/api/admin/users/${target.id}/mfa`, { headers: { Cookie: adminCookie }, data: { action: 'setup' } });
  expect(setup.status()).toBe(200);
  const setupBody = await setup.json();
  expect(setupBody.secret).toMatch(/^[A-Z2-7]{32}$/);
  expect(setupBody.otpauthUri).toContain('otpauth://totp/');

  const enable = await request.post(`/api/admin/users/${target.id}/mfa`, { headers: { Cookie: adminCookie }, data: { action: 'enable', code: createTotp(setupBody.secret) } });
  expect(enable.ok()).toBeTruthy();

  const missingCode = await request.post('/api/auth/login', { data: { email: 'mfa@firm.com', password: 'password123' } });
  expect(missingCode.status()).toBe(200);
  expect((await missingCode.json()).mfaRequired).toBeTruthy();

  const invalidCode = await request.post('/api/auth/login', { data: { email: 'mfa@firm.com', password: 'password123', mfaCode: '000000' } });
  expect(invalidCode.status()).toBe(401);

  const validLogin = await request.post('/api/auth/login', { data: { email: 'mfa@firm.com', password: 'password123', mfaCode: createTotp(setupBody.secret) } });
  expect(validLogin.ok()).toBeTruthy();
  const validBody = await validLogin.json();
  expect(validBody.user.mfaSecret).toBeUndefined();

  const disabled = await request.delete(`/api/admin/users/${target.id}/mfa`, { headers: { Cookie: adminCookie } });
  expect(disabled.ok()).toBeTruthy();
});
