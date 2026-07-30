import { test, expect } from '@playwright/test';
import { extractMatterDataFromDocument } from '../lib/document-extractor';
import fs from 'fs';
import path from 'path';

test.describe('Matter Document Import Feature (Smart Extraction & Human Review)', () => {

  test('Extractor parses Arabic court document fields correctly', async () => {
    const sampleArabicDocText = `
      المحكمة العامة بالرياض
      الدائرة القضائية الخامسة
      رقم القضية: 1445/98765
      تاريخ الجلسة: 1445/08/15
      المدعي: شركه الأفق للمقاولات
      المدعى عليه: موسسة التقنية الوطنية
      مبلغ وقدره: 250000 ريال
      الموضوع: مطالبة سداد مستحقات مالية عن عقود التوريد
    `;

    const textBuffer = Buffer.from(sampleArabicDocText, 'utf-8');
    const tempFilePath = path.join(process.cwd(), 'data', 'temp_test_doc.txt');
    fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    fs.writeFileSync(tempFilePath, textBuffer);

    try {
      const result = await extractMatterDataFromDocument(tempFilePath, 'text/plain');
      
      expect(result.data.caseNumber).toBe('1445/98765');
      expect(result.confidence.caseNumber).toBe('MEDIUM');

      expect(result.data.courtName).toBe('المحكمة العامة');
      expect(result.confidence.courtName).toBe('HIGH');

      expect(result.data.plaintiff).toContain('شركه الأفق للمقاولات');
      expect(result.data.defendant).toContain('موسسة التقنية الوطنية');

      expect(result.data.circuitNumber).toBe('الخامسة');
      expect(result.data.cityRegion).toBe('الرياض');
      expect(result.data.amountClaimed).toBe('250000');
    } finally {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  });

  test('Graceful handling for scanned image or empty document', async () => {
    const emptyBuffer = Buffer.from('PDF-RAW-IMAGE-STREAM', 'utf-8');
    const tempFilePath = path.join(process.cwd(), 'data', 'temp_empty_img.txt');
    fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    fs.writeFileSync(tempFilePath, emptyBuffer);

    try {
      const result = await extractMatterDataFromDocument(tempFilePath, 'image/png');
      expect(result.data.extractionNotice).toBe('تعذر استخراج النص من هذا الملف، يرجى الإدخال يدويًا.');
      expect(result.confidence.caseNumber).toBe('NULL');
      expect(result.confidence.courtName).toBe('NULL');
    } finally {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  });

  test('Unauthenticated user receives 401 on import endpoints', async ({ request }) => {
    const importRes = await request.post('/api/lawyer/matters/import');
    expect(importRes.status()).toBe(401);

    const confirmRes = await request.post('/api/lawyer/matters/import/invalid-id/confirm', {
      data: { title: 'Test' }
    });
    expect(confirmRes.status()).toBe(401);

    const rejectRes = await request.post('/api/lawyer/matters/import/invalid-id/reject');
    expect(rejectRes.status()).toBe(401);
  });

});
