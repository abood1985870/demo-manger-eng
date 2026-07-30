import { NextResponse } from 'next/server';
import { getSession, canCreateCase } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: draftId } = await params;

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    if (!canCreateCase(session)) {
      return NextResponse.json({ error: 'ليس لديك صلاحية إنشاء مشروع جديدة' }, { status: 403 });
    }

    const draft = await prisma.matterImportDraft.findUnique({
      where: { id: draftId }
    });

    if (!draft) {
      return NextResponse.json({ error: 'لم يتم العثور على المسودة المطلوبة' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (draft.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه المسودة' }, { status: 403 });
    }

    if (draft.status !== 'PENDING_REVIEW') {
      return NextResponse.json({ error: 'تمت مراجعة هذه المسودة مسبقاً' }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      caseNumber,
      clientId,
      beneficiaryAccountId,
      lawyerId,
      summary,
    } = body;

    const matterTitle = title || `مشروع رقم ${caseNumber || 'جديدة'}`;

    // Create the actual Matter record
    const matter = await prisma.matter.create({
      data: {
        tenantId: session.tenantId,
        title: matterTitle,
        caseNumber: caseNumber || null,
        clientId: clientId || null,
        beneficiaryAccountId: beneficiaryAccountId || null,
        lawyerId: lawyerId || session.userId,
        status: 'NEW',
        statusUpdatedAt: new Date(),
        statusUpdatedById: session.userId,
      }
    });

    // Link the uploaded document to the matter
    if (draft.filePath) {
      await prisma.document.create({
        data: {
          matterId: matter.id,
          title: `المستند الأصلي - ${draft.fileName}`,
          fileUrl: draft.filePath,
          type: draft.fileName.split('.').pop() || 'pdf',
        }
      });
    }

    // Update Draft status to CONFIRMED
    await prisma.matterImportDraft.update({
      where: { id: draftId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmedById: session.userId,
      }
    });

    return NextResponse.json({
      success: true,
      matterId: matter.id,
      message: 'تم تأكيد البيانات وإنشاء المشروع بنجاح.',
    });

  } catch (error: any) {
    console.error('Error confirming matter import:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تأكيد وإنشاء المشروع.' }, { status: 500 });
  }
}
