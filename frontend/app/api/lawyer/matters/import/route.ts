export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession, canCreateCase } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { privateUploadsDirectory, storeDocument } from '@/lib/document-storage';
import { extractMatterDataFromDocument } from '@/lib/document-extractor';
import { resolve } from 'path';

const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg'];

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    if (!canCreateCase(session)) {
      return NextResponse.json({ error: 'ليس لديك صلاحية إنشاء مشروع جديدة' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'يرجى رفع ملف المستند' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'نوع الملف غير مسموح به. يرجى رفع ملف PDF أو صورة (PNG, JPG, JPEG).' }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم الملف يتجاوز الحد الأقصى المسموح به (15 ميجابايت).' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Store file securely
    const { storageKey, safeName } = await storeDocument(session.tenantId, file.name, buffer);
    
    // Resolve absolute path on disk for extraction
    const relativePath = storageKey.replace('private:', '');
    const storageRoot = privateUploadsDirectory();
    const absoluteFilePath = resolve(storageRoot, relativePath);

    // 2. Run local text & data extraction
    const extractionResult = await extractMatterDataFromDocument(absoluteFilePath, file.type);
    const { data: extractedData, confidence } = extractionResult;

    // 3. Duplicate Matter Detection
    let duplicateWarning: string | null = null;
    if (extractedData.caseNumber) {
      const existingMatter = await prisma.matter.findFirst({
        where: {
          tenantId: session.tenantId,
          caseNumber: extractedData.caseNumber,
        },
        select: { id: true, title: true, caseNumber: true }
      });

      if (existingMatter) {
        duplicateWarning = `تنبيه: توجد مشروع مطابقة بنفس رقم المشروع (${existingMatter.caseNumber}) بعنوان "${existingMatter.title}".`;
      }
    }

    // 4. Save Draft in DB
    const draft = await prisma.matterImportDraft.create({
      data: {
        tenantId: session.tenantId,
        uploadedById: session.userId,
        filePath: storageKey,
        fileName: safeName,
        extractedData: JSON.stringify(extractedData),
        confidence: JSON.stringify(confidence),
        status: 'PENDING_REVIEW',
      }
    });

    return NextResponse.json({
      success: true,
      draftId: draft.id,
      fileName: safeName,
      extractedData,
      confidence,
      duplicateWarning,
    });

  } catch (error: any) {
    console.error('Error importing matter document:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحليل الملف واستخراج البيانات.' }, { status: 500 });
  }
}
