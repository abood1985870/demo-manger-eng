import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
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

    await prisma.matterImportDraft.update({
      where: { id: draftId },
      data: {
        status: 'REJECTED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم رفض مسودة المستند وتجاهلها بنجاح.'
    });

  } catch (error: any) {
    console.error('Error rejecting matter import:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إلغاء المسودة.' }, { status: 500 });
  }
}
