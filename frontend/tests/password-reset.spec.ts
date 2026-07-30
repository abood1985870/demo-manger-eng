import { expect, test } from '@playwright/test';

test('password reset enforces office and system manager boundaries', async ({ request }) => {
  const login = async (email: string, password: string) => request.post('/api/auth/login', { data: { email, password } });
  const adminLogin = await login('admin@firm.com', 'password123');
  expect(adminLogin.ok()).toBeTruthy();
  const adminHeaders = { Cookie: adminLogin.headers()['set-cookie']! };
  const users = await request.get('/api/admin/users', { headers: adminHeaders });
  const lawyer = (await users.json()).find((user: { email: string }) => user.email === 'lawyer@firm.com');
  const manager = (await users.json()).find((user: { email: string }) => user.email === 'admin@firm.com');

  const deniedManagerReset = await request.post(`/api/admin/users/${manager.id}/password-reset`, { headers: adminHeaders, data: { temporaryPassword: 'TemporaryPass123!' } });
  expect(deniedManagerReset.status()).toBe(403);

  const resetLawyer = await request.post(`/api/admin/users/${lawyer.id}/password-reset`, { headers: adminHeaders, data: { temporaryPassword: 'TemporaryPass123!' } });
  expect(resetLawyer.ok()).toBeTruthy();
  expect((await resetLawyer.json()).mustChangePassword).toBeTruthy();
  expect((await login('lawyer@firm.com', 'password123')).status()).toBe(401);
  const temporaryLogin = await login('lawyer@firm.com', 'TemporaryPass123!');
  expect(temporaryLogin.ok()).toBeTruthy();
  expect((await temporaryLogin.json()).mustChangePassword).toBeTruthy();
  const restoreLawyer = await request.post('/api/auth/change-password', { headers: { Cookie: temporaryLogin.headers()['set-cookie']! }, data: { currentPassword: 'TemporaryPass123!', newPassword: 'password123' } });
  expect(restoreLawyer.ok()).toBeTruthy();

  const systemLogin = await login('system@platform.test', 'password123');
  expect(systemLogin.ok(), `system manager login returned ${systemLogin.status()}: ${await systemLogin.text()}`).toBeTruthy();
  const systemHeaders = { Cookie: systemLogin.headers()['set-cookie']! };
  const systemUsers = await request.get('/api/admin/users', { headers: systemHeaders });
  const targetManager = (await systemUsers.json()).find((user: { email: string }) => user.email === 'admin@firm.com');
  const resetManager = await request.post(`/api/admin/users/${targetManager.id}/password-reset`, { headers: systemHeaders, data: { temporaryPassword: 'ManagerTemp123!' } });
  expect(resetManager.ok()).toBeTruthy();
  expect((await login('admin@firm.com', 'password123')).status()).toBe(401);
  const managerLogin = await login('admin@firm.com', 'ManagerTemp123!');
  expect(managerLogin.ok()).toBeTruthy();
  const restoreManager = await request.post('/api/auth/change-password', { headers: { Cookie: managerLogin.headers()['set-cookie']! }, data: { currentPassword: 'ManagerTemp123!', newPassword: 'password123' } });
  expect(restoreManager.ok()).toBeTruthy();
});
