import { expect, test } from '@playwright/test';

test('tenant and matter authorization rejects cross-company access', async ({ request }) => {
  const loginA = await request.post('/api/auth/login', {
    data: { email: 'lawyer@firm.com', password: 'password123' },
  });
  expect(loginA.ok()).toBeTruthy();
  const cookieA = loginA.headers()['set-cookie'];
  expect(cookieA).toBeDefined();

  const loginB = await request.post('/api/auth/login', {
    data: { email: 'lawyer@secondary-firm.test', password: 'password123' },
  });
  expect(loginB.ok()).toBeTruthy();
  const cookieB = loginB.headers()['set-cookie'];
  expect(cookieB).toBeDefined();

  const mattersA = await request.get('/api/lawyer/matters?tenantId=spoofed-tenant', {
    headers: { Cookie: cookieA },
  });
  expect(mattersA.ok()).toBeTruthy();
  const matterA = (await mattersA.json()).find((matter: { caseNumber: string }) => matter.caseNumber === 'RUH-2026-01');
  expect(matterA).toBeDefined();
  expect(matterA.tenantId).not.toBe('spoofed-tenant');

  const adminLogin = await request.post('/api/auth/login', {
    data: { email: 'admin@firm.com', password: 'password123' },
  });
  expect(adminLogin.ok()).toBeTruthy();
  const adminCookie = adminLogin.headers()['set-cookie'];
  expect(adminCookie).toBeDefined();

  const managerDetail = await request.get(`/api/lawyer/matters/${matterA.id}`, {
    headers: { Cookie: adminCookie },
  });
  expect(managerDetail.ok()).toBeTruthy();

  const emptyTitle = await request.patch(`/api/lawyer/matters/${matterA.id}`, {
    headers: { Cookie: cookieA },
    data: { title: '   ' },
  });
  expect(emptyTitle.status()).toBe(400);

  const usersA = await request.get('/api/lawyer/users', { headers: { Cookie: cookieA } });
  expect(usersA.ok()).toBeTruthy();
  const mfaUser = (await usersA.json()).find((user: { email: string }) => user.email === 'mfa@firm.com');
  expect(mfaUser).toBeDefined();

  const addTaskMember = await request.patch(`/api/lawyer/matters/${matterA.id}`, {
    headers: { Cookie: adminCookie },
    data: { teamMemberIds: [mfaUser.id] },
  });
  expect(addTaskMember.ok()).toBeTruthy();

  const newTask = await request.post('/api/lawyer/tasks', {
    headers: { Cookie: cookieA },
    data: { matterId: matterA.id, userId: matterA.lawyerId, title: 'Task ownership boundary' },
  });
  expect(newTask.ok()).toBeTruthy();
  const taskId = (await newTask.json()).id;

  const mfaLogin = await request.post('/api/auth/login', {
    data: { email: 'mfa@firm.com', password: 'password123' },
  });
  expect(mfaLogin.ok()).toBeTruthy();
  const mfaCookie = mfaLogin.headers()['set-cookie'];
  expect(mfaCookie).toBeDefined();

  const crossTaskUpdate = await request.patch(`/api/lawyer/tasks/${taskId}`, {
    headers: { Cookie: mfaCookie },
    data: { isDone: true },
  });
  expect(crossTaskUpdate.status()).toBe(403);

  const crossTaskDelete = await request.delete(`/api/lawyer/tasks/${taskId}`, {
    headers: { Cookie: mfaCookie },
  });
  expect(crossTaskDelete.status()).toBe(403);

  const clientsB = await request.get('/api/lawyer/clients', { headers: { Cookie: cookieB } });
  expect(clientsB.ok()).toBeTruthy();
  const clientB = (await clientsB.json())[0];

  const usersB = await request.get('/api/lawyer/users', { headers: { Cookie: cookieB } });
  expect(usersB.ok()).toBeTruthy();
  const lawyerB = (await usersB.json()).find((user: { role: string }) => user.role.toLowerCase() === 'lawyer');
  expect(lawyerB).toBeDefined();

  const crossMatter = await request.get(`/api/lawyer/matters/${matterA.id}`, {
    headers: { Cookie: cookieB },
  });
  expect(crossMatter.status()).toBe(404);

  const crossMessages = await request.get(`/api/lawyer/matters/${matterA.id}/messages`, {
    headers: { Cookie: cookieB },
  });
  expect(crossMessages.status()).toBe(404);

  const spoofedAssignment = await request.post('/api/lawyer/matters', {
    headers: { Cookie: adminCookie },
    data: {
      title: `Security isolation ${Date.now()}`,
      tenantId: 'spoofed-tenant',
      lawyerId: lawyerB.id,
      beneficiaryAccountId: matterA.clientId,
    },
  });
  expect(spoofedAssignment.status()).toBe(400);

  const spoofedClient = await request.post('/api/lawyer/matters', {
    headers: { Cookie: adminCookie },
    data: {
      title: `Client isolation ${Date.now()}`,
      clientId: clientB.id,
      beneficiaryAccountId: matterA.clientId,
    },
  });
  expect(spoofedClient.status()).toBe(400);

  const message = await request.post(`/api/lawyer/matters/${matterA.id}/messages`, {
    headers: { Cookie: cookieA },
    data: {
      body: 'Authorization boundary check',
      clientRequestId: `security-${Date.now()}`,
    },
  });
  expect(message.status()).toBe(201);
  const messageId = (await message.json()).id;

  const crossEdit = await request.patch(`/api/lawyer/matters/${matterA.id}/messages/${messageId}`, {
    headers: { Cookie: cookieB },
    data: { body: 'Unauthorized edit' },
  });
  expect(crossEdit.status()).toBe(404);

  const crossDelete = await request.delete(`/api/lawyer/matters/${matterA.id}/messages/${messageId}`, {
    headers: { Cookie: cookieB },
  });
  expect(crossDelete.status()).toBe(404);
});
