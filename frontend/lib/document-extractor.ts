import fs from 'fs';
import path from 'path';

export interface ExtractedMatterData {
  caseNumber: string | null;
  courtName: string | null;
  caseType: string | null;
  plaintiff: string | null;
  defendant: string | null;
  clientName: string | null;
  docDate: string | null;
  nextHearingDate: string | null;
  circuitNumber: string | null;
  cityRegion: string | null;
  amountClaimed: string | null;
  summary: string | null;
  extractionNotice?: string | null;
}

export interface FieldConfidence {
  caseNumber: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  courtName: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  caseType: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  plaintiff: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  defendant: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  clientName: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  docDate: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  nextHearingDate: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  circuitNumber: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  cityRegion: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  amountClaimed: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
  summary: 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL';
}

export interface DocumentExtractionResult {
  data: ExtractedMatterData;
  confidence: FieldConfidence;
  rawText: string;
}

/**
 * Extracts plain text from a buffer (PDF or plain text).
 * Handles text-based PDF streams and plain text gracefully.
 */
export function extractRawTextFromBuffer(buffer: Buffer, mimeType: string): string {
  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }

  const str = buffer.toString('utf-8');
  
  // Extract text strings from PDF stream commands (TJ / Tj brackets) or literal text
  let extracted = '';
  
  // Match text inside parenthesis or array in PDF text blocks
  const textMatches = str.match(/\(([^()]{2,})\)/g) || [];
  if (textMatches.length > 5) {
    extracted = textMatches
      .map(m => m.slice(1, -1))
      .filter(s => s.trim().length > 1 && !/^[0-9a-fA-F]{10,}$/.test(s))
      .join(' ');
  }

  // Fallback: clean non-printable characters
  if (!extracted || extracted.length < 20) {
    const rawPrintable = str.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF0-9a-zA-Z\s.,/\-\:\(\)]/g, ' ');
    const tokens = rawPrintable.split(/\s+/).filter(t => t.length > 1);
    extracted = tokens.join(' ');
  }

  return extracted.trim();
}

/**
 * Main extraction function for Arabic legal documents.
 */
export async function extractMatterDataFromDocument(
  filePath: string,
  mimeType: string
): Promise<DocumentExtractionResult> {
  const fileBuffer = fs.readFileSync(filePath);
  const rawText = extractRawTextFromBuffer(fileBuffer, mimeType);

  const isImageOrScanned = (mimeType.startsWith('image/') || rawText.length < 25);
  
  const data: ExtractedMatterData = {
    caseNumber: null,
    courtName: null,
    caseType: null,
    plaintiff: null,
    defendant: null,
    clientName: null,
    docDate: null,
    nextHearingDate: null,
    circuitNumber: null,
    cityRegion: null,
    amountClaimed: null,
    summary: null,
    extractionNotice: isImageOrScanned
      ? 'تعذر استخراج النص من هذا الملف، يرجى الإدخال يدويًا.'
      : null,
  };

  const confidence: FieldConfidence = {
    caseNumber: 'NULL',
    courtName: 'NULL',
    caseType: 'NULL',
    plaintiff: 'NULL',
    defendant: 'NULL',
    clientName: 'NULL',
    docDate: 'NULL',
    nextHearingDate: 'NULL',
    circuitNumber: 'NULL',
    cityRegion: 'NULL',
    amountClaimed: 'NULL',
    summary: 'NULL',
  };

  if (isImageOrScanned) {
    return { data, confidence, rawText: '' };
  }

  // 1. Case Number Extraction
  // Examples: رقم المشروع: 1445/1234, مشروع رقم 458923, رقم المعاملة 12345
  const caseNumRegex = /(?:رقم\s+المشروع|مشروع\s+رقم|رقم\s+المعاملة|رقم\s+الطلب|مقيدة\s+برقم|معاملة\s+رقم)[\s:\-]*(?:رقم)?\s*([0-9\u0660-\u0669\/\-]{3,20})/i;
  const caseNumMatch = rawText.match(caseNumRegex);
  if (caseNumMatch) {
    data.caseNumber = caseNumMatch[1].trim();
    confidence.caseNumber = 'HIGH';
  } else {
    // Fallback: standalone numbers formatted like case numbers e.g. 441029384
    const standaloneCaseNum = rawText.match(/\b(4[0-9]{7,10}|14[0-4][0-9]\/[0-9]{3,7})\b/);
    if (standaloneCaseNum) {
      data.caseNumber = standaloneCaseNum[1];
      confidence.caseNumber = 'MEDIUM';
    }
  }

  // 2. Court Name Extraction
  const courtsList = [
    'المحكمة العامة',
    'المحكمة التجارية',
    'المحكمة الجزائية',
    'محكمة الأحوال الشخصية',
    'المحكمة العمالية',
    'محكمة الاستئناف',
    'محكمة التنفيذ',
    'المحكمة العليا',
    'الهيئة الابتدائية',
  ];
  for (const court of courtsList) {
    if (rawText.includes(court)) {
      data.courtName = court;
      confidence.courtName = 'HIGH';
      break;
    }
  }
  if (!data.courtName && rawText.includes('المحكمة')) {
    const courtMatch = rawText.match(/(المحكمة\s+[\u0600-\u06FF]+)/);
    if (courtMatch) {
      data.courtName = courtMatch[1];
      confidence.courtName = 'MEDIUM';
    }
  }

  // 3. Case Type Inference
  if (data.courtName) {
    if (data.courtName.includes('تجارية')) data.caseType = 'تجاري';
    else if (data.courtName.includes('عمالية')) data.caseType = 'عمالي';
    else if (data.courtName.includes('جزائية')) data.caseType = 'جزائي';
    else if (data.courtName.includes('الأحوال الشخصية')) data.caseType = 'أحوال شخصية';
    else if (data.courtName.includes('تنفيذ')) data.caseType = 'تنفيذي';
    else data.caseType = 'حقوقي عام';
    confidence.caseType = 'HIGH';
  }

  // 4. Parties Extraction (Plaintiff & Defendant)
  const plaintiffMatch = rawText.match(/(?:المدعي|المدعية|الطرف\s+الأول|طالب\s+التنفيذ)[\s:\-]+([\u0600-\u06FF\s]{3,35})/);
  if (plaintiffMatch) {
    data.plaintiff = plaintiffMatch[1].split(/[\n,;]/)[0].trim();
    confidence.plaintiff = 'HIGH';
  }

  const defendantMatch = rawText.match(/(?:المدعى\s+عليه|المدعى\s+عليها|الطرف\s+الثاني|المنفذ\s+ضده)[\s:\-]+([\u0600-\u06FF\s]{3,35})/);
  if (defendantMatch) {
    data.defendant = defendantMatch[1].split(/[\n,;]/)[0].trim();
    confidence.defendant = 'HIGH';
  }

  // 5. Circuit Number
  const circuitMatch = rawText.match(/(?:الدائرة\s+القضائية|الدائرة)[\s:\-]*(?:رقم)?\s*([0-9\u0660-\u0669]+|[\u0600-\u06FF]+)/);
  if (circuitMatch) {
    data.circuitNumber = circuitMatch[1].trim();
    confidence.circuitNumber = 'HIGH';
  }

  // 6. City / Region
  const cities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'مكة', 'المدينة المنورة', 'المدينة', 'الخبر', 'أبها', 'بريدة', 'تبوك', 'حائل', 'نجران', 'جازان'];
  for (const city of cities) {
    if (rawText.includes(city)) {
      data.cityRegion = city;
      confidence.cityRegion = 'MEDIUM';
      break;
    }
  }

  // 7. Dates (Doc Date & Next Hearing Date)
  const dateRegex = /(?:14[0-4][0-9]\/[0-1]?[0-9]\/[0-3]?[0-9]|20[2-3][0-9]\-[0-1]?[0-9]\-[0-3]?[0-9])/g;
  const foundDates = rawText.match(dateRegex) || [];

  const hearingMatch = rawText.match(/(?:موعد\s+الجلسة|تاريخ\s+الجلسة|جلسة\s+يوم)[\s:\-]*([0-9\/\-]{8,10})/);
  if (hearingMatch) {
    data.nextHearingDate = hearingMatch[1];
    confidence.nextHearingDate = 'HIGH';
  } else if (foundDates.length > 0) {
    data.nextHearingDate = foundDates[0];
    confidence.nextHearingDate = 'LOW';
  }

  if (foundDates.length > 1) {
    data.docDate = foundDates[foundDates.length - 1];
    confidence.docDate = 'MEDIUM';
  } else if (foundDates.length === 1 && !data.nextHearingDate) {
    data.docDate = foundDates[0];
    confidence.docDate = 'MEDIUM';
  }

  // 8. Amount Claimed
  const amountMatch = rawText.match(/(?:مبلغ|مطالبة\s+بمبلغ|قيمة\s+المطالبة|مبلغ\s+وقدره)[\s:\-]*([0-9\u0660-\u0669][0-9,.\u0660-\u0669\s]*)/);
  if (amountMatch) {
    data.amountClaimed = amountMatch[1].trim().split(/\s+/)[0];
    confidence.amountClaimed = 'HIGH';
  }

  // 9. Summary Extraction
  const cleanLines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 15 && !l.includes('PDF') && !l.includes('Page'));

  if (cleanLines.length > 0) {
    data.summary = cleanLines.slice(0, 3).join(' - ').substring(0, 250);
    confidence.summary = 'MEDIUM';
  }

  return { data, confidence, rawText };
}
