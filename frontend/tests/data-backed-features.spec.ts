import { expect, test } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

function uploadedDocumentPath(storageRoot: string, filename: string) {
  for (const tenantDirectory of readdirSync(storageRoot, { withFileTypes: true })) {
    if (!tenantDirectory.isDirectory()) continue;
    const tenantPath = join(storageRoot, tenantDirectory.name);
    const uploadedFile = readdirSync(tenantPath).find((entry) => entry.endsWith(`-${filename}`));
    if (uploadedFile) return join(tenantPath, uploadedFile);
  }
  return null;
}

test('matter documents are private, validated, downloadable, and deleted with their file', async ({ request }) => {
  const login = await request.post('/api/auth/login', { data: { email: 'lawyer@firm.com', password: 'password123' } });
  expect(login.ok()).toBeTruthy();
  const headers = { Cookie: login.headers()['set-cookie']! };
  const matters = await request.get('/api/lawyer/matters', { headers });
  const matter = (await matters.json())[0];
  expect(matter).toBeDefined();

  const rejectedUpload = await request.post('/api/lawyer/documents', {
    headers,
    multipart: { matterId: matter.id, file: { name: 'unsafe.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('not a safe project attachment') } },
  });
  expect(rejectedUpload.status()).toBe(415);

  const filename = `qa-evidence-${Date.now()}.pdf`;
  const upload = await request.post('/api/lawyer/documents', {
    headers,
    multipart: { matterId: matter.id, file: { name: filename, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\nQA evidence') } },
  });
  expect(upload.status()).toBe(201);
  const document = await upload.json();
  expect(document.fileUrl).toBeUndefined();
  expect(document.downloadUrl).toBe(`/api/lawyer/documents/${document.id}/download`);

  const storageRoot = process.env.DOCUMENT_STORAGE_PATH || join(tmpdir(), 'rusukh-playwright-documents');
  const physicalFile = uploadedDocumentPath(storageRoot, filename);
  if (!physicalFile) throw new Error('Uploaded document was not found in private storage');
  expect(physicalFile.includes('public')).toBeFalsy();
  expect(existsSync(physicalFile)).toBeTruthy();
  const directPublicRequest = await request.get(`/uploads/${relative(storageRoot, physicalFile).replace(/\\/g, '/')}`);
  expect(directPublicRequest.status()).toBe(404);

  const download = await request.get(document.downloadUrl, { headers });
  expect(download.ok()).toBeTruthy();
  expect(download.headers()['content-type']).toContain('application/pdf');
  expect(await download.body()).toEqual(Buffer.from('%PDF-1.4\nQA evidence'));

  const removed = await request.delete(`/api/lawyer/documents?id=${document.id}`, { headers });
  expect(removed.ok()).toBeTruthy();
  expect(existsSync(physicalFile)).toBeFalsy();
  const unavailable = await request.get(document.downloadUrl, { headers });
  expect(unavailable.status()).toBe(404);
});

test('litigation, compliance, and knowledge persist through their APIs', async ({ request }) => {
  const login = await request.post('/api/auth/login', { data: { email: 'lawyer@firm.com', password: 'password123' } });
  expect(login.ok()).toBeTruthy();
  const cookie = login.headers()['set-cookie'];
  expect(cookie).toBeDefined();
  const headers = { Cookie: cookie };

  const dashboardResponse = await request.get('/api/lawyer/dashboard', { headers });
  expect(dashboardResponse.ok()).toBeTruthy();
  const dashboard = await dashboardResponse.json();
  expect(typeof dashboard.summary.openMattersCount).toBe('number');
  expect(typeof dashboard.summary.totalClientsCount).toBe('number');

  const mattersResponse = await request.get('/api/lawyer/matters', { headers });
  expect(mattersResponse.ok()).toBeTruthy();
  const matter = (await mattersResponse.json())[0];
  expect(matter).toBeDefined();

  const hearingResponse = await request.post('/api/lawyer/hearings', {
    headers,
    data: { matterId: matter.id, court: 'QA Commercial Court', date: new Date(Date.now() + 86400000).toISOString(), summary: 'Persisted hearing check' },
  });
  expect(hearingResponse.ok()).toBeTruthy();
  const hearing = await hearingResponse.json();
  expect(hearing.matterId).toBe(matter.id);

  const clientsResponse = await request.get('/api/lawyer/clients', { headers });
  expect(clientsResponse.ok()).toBeTruthy();
  const client = (await clientsResponse.json())[0];

  const complianceResponse = await request.post('/api/lawyer/compliance', {
    headers,
    data: { title: 'QA KYC record', caseType: 'KYC', riskLevel: 'high', clientId: client.id, details: 'Persisted compliance check' },
  });
  expect(complianceResponse.status()).toBe(201);
  const compliance = await complianceResponse.json();
  expect(compliance.clientId).toBe(client.id);

  const complianceUpdate = await request.patch('/api/lawyer/compliance', { headers, data: { id: compliance.id, status: 'compliant' } });
  expect(complianceUpdate.ok()).toBeTruthy();
  expect((await complianceUpdate.json()).status).toBe('compliant');

  const knowledgeResponse = await request.post('/api/lawyer/knowledge', {
    headers,
    data: { title: 'QA legal note', category: 'Internal note', content: 'Persisted knowledge check' },
  });
  expect(knowledgeResponse.status()).toBe(201);
  const knowledge = await knowledgeResponse.json();
  expect(knowledge.createdById).toBeDefined();

  const knowledgeList = await request.get('/api/lawyer/knowledge', { headers });
  expect(knowledgeList.ok()).toBeTruthy();
  expect((await knowledgeList.json()).some((item: { id: string }) => item.id === knowledge.id)).toBeTruthy();

  const invoices = await request.get('/api/lawyer/invoices', { headers });
  expect(invoices.ok()).toBeTruthy();
  const invoice = (await invoices.json())[0];
  const invoiceDocument = await request.get(`/api/lawyer/invoices/${invoice.id}/document`, { headers });
  expect(invoiceDocument.ok()).toBeTruthy();
  expect(invoiceDocument.headers()['content-type']).toContain('text/html');
  const adminLogin = await request.post('/api/auth/login', { data: { email: 'admin@firm.com', password: 'password123' } });
  expect(adminLogin.ok()).toBeTruthy();
  const adminCookie = adminLogin.headers()['set-cookie'];
  expect(adminCookie).toBeDefined();
  const adminOverview = await request.get('/api/admin/overview', { headers: { Cookie: adminCookie } });
  expect(adminOverview.ok()).toBeTruthy();
  const overview = await adminOverview.json();
  expect(overview.tenant.id).toBeDefined();
  expect(overview.counts.users).toBeGreaterThan(0);
  expect(await invoiceDocument.text()).toContain('فاتورة خدمات إدارة وتطوير عقاري');
});
