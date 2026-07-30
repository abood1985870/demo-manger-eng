export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';
import { MATTER_STATUS_ARABIC, MatterStatus } from '@/lib/matter-status';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matterId } = await params;
    const session = await getSession('documents');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: {
        client: true,
        beneficiaryAccount: true,
        lawyer: true,
        tenant: true,
        developmentProfile: true,
        hearings: { orderBy: { date: 'asc' } }
      }
    });

    if (!matter) {
      return NextResponse.json({ error: 'المشروع غير موجـودة' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (matter.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه المشروع' }, { status: 403 });
    }

    const body = await request.json();
    const { templateId, customTitle, editedContent } = body;

    if (!templateId) {
      return NextResponse.json({ error: 'يرجى اختيار قالب المشروع' }, { status: 400 });
    }

    const template = await prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template || template.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'القالب غير موجود أو غير تابع لشركتكم' }, { status: 404 });
    }

    // Prepare Variable Substitution Values
    const clientName = matter.client?.name || matter.externalPartyName || '[يحتاج تعبئة يدوية: اسم العميل]';
    const beneficiaryName = matter.beneficiaryAccount?.name || '[يحتاج تعبئة يدوية: الحساب المستفيد]';
    const caseNumber = matter.caseNumber || matter.id.substring(0, 8);
    const matterTitle = matter.title;
    const courtName = matter.developmentProfile?.city || matter.externalPartyName || 'الموقع أو الجهة المختصة';
    const opponentName = matter.externalPartyName || '[يحتاج تعبئة يدوية: اسم المقاول أو المورد أو الطرف الخارجي]';
    const lawyerName = matter.lawyer?.name || session.userId;
    const companyName = matter.tenant?.name || 'شركة التطوير العقاري';
    const today = new Date().toLocaleDateString('ar-SA');
    const matterStatus = MATTER_STATUS_ARABIC[matter.status as MatterStatus] || matter.status;
    const claimAmount = matter.developmentProfile?.projectValue || 'القيمة المحددة بملف المشروع';

    // Nearest hearing date
    const futureHearings = matter.hearings.filter(h => new Date(h.date) >= new Date());
    const hearingDate = futureHearings.length > 0
      ? new Date(futureHearings[0].date).toLocaleDateString('ar-SA')
      : today;

    // Use edited content if provided by user during review, else compute substituted template content
    let finalContent = editedContent;

    if (!finalContent) {
      finalContent = template.content;

      // Replace double-brace mustache variables {{variableName}}
      finalContent = finalContent.replace(/\{\{clientName\}\}/g, clientName);
      finalContent = finalContent.replace(/\{\{beneficiaryName\}\}/g, beneficiaryName);
      finalContent = finalContent.replace(/\{\{caseNumber\}\}/g, caseNumber);
      finalContent = finalContent.replace(/\{\{matterTitle\}\}/g, matterTitle);
      finalContent = finalContent.replace(/\{\{courtName\}\}/g, courtName);
      finalContent = finalContent.replace(/\{\{opponentName\}\}/g, opponentName);
      finalContent = finalContent.replace(/\{\{lawyerName\}\}/g, lawyerName);
      finalContent = finalContent.replace(/\{\{companyName\}\}/g, companyName);
      finalContent = finalContent.replace(/\{\{today\}\}/g, today);
      finalContent = finalContent.replace(/\{\{matterStatus\}\}/g, matterStatus);
      finalContent = finalContent.replace(/\{\{claimAmount\}\}/g, claimAmount);
      finalContent = finalContent.replace(/\{\{hearingDate\}\}/g, hearingDate);
      finalContent = finalContent.replace(/\{\{client_name\}\}/g, clientName);
      finalContent = finalContent.replace(/\{\{beneficiary_name\}\}/g, beneficiaryName);
      finalContent = finalContent.replace(/\{\{case_number\}\}/g, caseNumber);
      finalContent = finalContent.replace(/\{\{matter_title\}\}/g, matterTitle);
      finalContent = finalContent.replace(/\{\{court_name\}\}/g, courtName);
      finalContent = finalContent.replace(/\{\{opponent_name\}\}/g, opponentName);
      finalContent = finalContent.replace(/\{\{lawyer_name\}\}/g, lawyerName);
      finalContent = finalContent.replace(/\{\{company_name\}\}/g, companyName);
      finalContent = finalContent.replace(/\{\{current_date\}\}/g, today);
      finalContent = finalContent.replace(/\{\{matter_status\}\}/g, matterStatus);
      finalContent = finalContent.replace(/\{\{project_value\}\}/g, claimAmount);
      finalContent = finalContent.replace(/\{\{hearing_date\}\}/g, hearingDate);

      // Backward compatibility with single-brace placeholders
      finalContent = finalContent.replace(/\{client_name\}/g, clientName);
      finalContent = finalContent.replace(/\{case_number\}/g, caseNumber);
      finalContent = finalContent.replace(/\{court_name\}/g, courtName);
      finalContent = finalContent.replace(/\{date\}/g, today);
      finalContent = finalContent.replace(/\{amount\}/g, claimAmount);
      finalContent = finalContent.replace(/\{lawyer_name\}/g, lawyerName);
    }

    const documentTitle = customTitle || `${template.title} - ${matter.caseNumber || matter.title}`;

    // Store generated document linked to matter
    const doc = await prisma.document.create({
      data: {
        matterId: matter.id,
        title: documentTitle,
        fileUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(finalContent)}`,
        type: 'pdf',
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'LEGAL_DOCUMENT_GENERATE',
      entityType: 'Document',
      entityId: doc.id,
      metadata: { templateId: template.id, templateTitle: template.title, matterId: matter.id },
      req: request,
    });

    return NextResponse.json({
      success: true,
      document: doc,
      generatedText: finalContent,
      message: 'تم توليد الوثيقة وتعبئة البيانات بنجاح في ملفات المشروع.'
    });

  } catch (error: any) {
    console.error('Error generating document from legal template:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء توليد الوثيقة التطويرية من القالب.' }, { status: 500 });
  }
}
