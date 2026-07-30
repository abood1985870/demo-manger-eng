import { expect, test } from '@playwright/test';

test('CREATE_CASE permission and beneficiary accounts are enforced per tenant', async ({ request }) => {
  const login = async (email: string) => request.post('/api/auth/login', { data: { email, password: 'password123' } });
  const adminLogin = await login('admin@firm.com');
  const adminHeaders = { Cookie: adminLogin.headers()['set-cookie']! };
  const users = await request.get('/api/admin/users', { headers: adminHeaders });
  const lawyer = (await users.json()).find((user: { email: string }) => user.email === 'lawyer@firm.com');
  const clients = await request.get('/api/lawyer/clients', { headers: adminHeaders });
  const beneficiary = (await clients.json())[0];

  const initialLawyerLogin = await login('lawyer@firm.com');
  const denied = await request.post('/api/lawyer/matters', { headers: { Cookie: initialLawyerLogin.headers()['set-cookie']! }, data: { title: 'Denied matter', beneficiaryAccountId: beneficiary.id } });
  expect(denied.status()).toBe(403);

  const grant = await request.patch(`/api/admin/users/${lawyer.id}/permissions`, { headers: adminHeaders, data: { permission: 'CREATE_CASE', enabled: true } });
  expect(grant.ok()).toBeTruthy();
  const lawyerLogin = await login('lawyer@firm.com');
  const lawyerHeaders = { Cookie: lawyerLogin.headers()['set-cookie']! };
  const created = await request.post('/api/lawyer/matters', { headers: lawyerHeaders, data: { title: 'Beneficiary permission QA', beneficiaryAccountId: beneficiary.id } });
  expect(created.status()).toBe(201);
  expect((await created.json()).beneficiaryAccount.id).toBe(beneficiary.id);

  const clientDetails = await request.get('/api/lawyer/clients', { headers: lawyerHeaders });
  const linkedClient = (await clientDetails.json()).find((client: { id: string }) => client.id === beneficiary.id);
  expect(linkedClient.beneficiaryMatters.some((matter: { title: string }) => matter.title === 'Beneficiary permission QA')).toBeTruthy();

  const otherLogin = await login('lawyer@secondary-firm.test');
  const otherClients = await request.get('/api/lawyer/clients', { headers: { Cookie: otherLogin.headers()['set-cookie']! } });
  const otherBeneficiary = (await otherClients.json())[0];
  const crossTenant = await request.post('/api/lawyer/matters', { headers: lawyerHeaders, data: { title: 'Cross tenant beneficiary', beneficiaryAccountId: otherBeneficiary.id } });
  expect(crossTenant.status()).toBe(400);

  const revoke = await request.patch(`/api/admin/users/${lawyer.id}/permissions`, { headers: adminHeaders, data: { permission: 'CREATE_CASE', enabled: false } });
  expect(revoke.ok()).toBeTruthy();
  const revokedLawyer = await login('lawyer@firm.com');
  const deniedAfterRevoke = await request.post('/api/lawyer/matters', { headers: { Cookie: revokedLawyer.headers()['set-cookie']! }, data: { title: 'Revoked permission matter', beneficiaryAccountId: beneficiary.id } });
  expect(deniedAfterRevoke.status()).toBe(403);
});
