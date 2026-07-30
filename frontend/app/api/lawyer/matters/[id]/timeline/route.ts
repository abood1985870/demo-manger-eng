import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MATTER_STATUS_ARABIC, MatterStatus } from '@/lib/matter-status';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matterId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: {
        statusHistory: {
          include: { changedBy: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        documents: { orderBy: { createdAt: 'desc' } },
        tasks: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        hearings: { orderBy: { createdAt: 'desc' } },
        messages: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 30
        }
      }
    });

    if (!matter) {
      return NextResponse.json({ error: 'المشروع غير موجـودة' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (matter.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه المشروع' }, { status: 403 });
    }

    const events: Array<{
      id: string;
      type: string;
      title: string;
      actorName: string;
      date: string;
      details?: string;
    }> = [];

    // 1. Matter Creation Event
    events.push({
      id: `create-${matter.id}`,
      type: 'MATTER_CREATED',
      title: 'إنشاء المشروع',
      actorName: 'النظام',
      date: matter.createdAt.toISOString(),
      details: `تمت إضافة المشروع بعنوان: "${matter.title}"`
    });

    // 2. Status History Events
    for (const h of matter.statusHistory) {
      const statusText = MATTER_STATUS_ARABIC[h.newStatus as MatterStatus] || h.newStatus;
      events.push({
        id: `status-${h.id}`,
        type: 'STATUS_CHANGED',
        title: 'تغيير حالة المشروع',
        actorName: h.changedBy?.name || 'مستخدم',
        date: h.createdAt.toISOString(),
        details: `تغيرت الحالة إلى: ${statusText}${h.note ? ` (${h.note})` : ''}`
      });
    }

    // 3. Document Upload Events
    for (const doc of matter.documents) {
      events.push({
        id: `doc-${doc.id}`,
        type: 'DOCUMENT_ADDED',
        title: 'إضافة مستند جديد',
        actorName: 'مستخدم',
        date: doc.createdAt.toISOString(),
        details: `تم رفع المستند: ${doc.title}`
      });
    }

    // 4. Task Events
    for (const t of matter.tasks) {
      events.push({
        id: `task-${t.id}`,
        type: t.isDone ? 'TASK_COMPLETED' : 'TASK_ADDED',
        title: t.isDone ? 'إنجاز مهمة' : 'إضافة مهمة جديدة',
        actorName: t.user?.name || 'مستخدم',
        date: t.updatedAt.toISOString(),
        details: `${t.title} - الأولوية: ${t.priority}`
      });
    }

    // 5. Hearing / Appointment Events
    for (const h of matter.hearings) {
      events.push({
        id: `hearing-${h.id}`,
        type: 'HEARING_ADDED',
        title: 'إضافة موعد / مرحلة',
        actorName: 'مستخدم',
        date: h.createdAt.toISOString(),
        details: `${h.title || h.court} بتاريخ: ${new Date(h.date).toLocaleDateString('ar-SA')}`
      });
    }

    // 6. Messages Events
    for (const msg of matter.messages) {
      events.push({
        id: `msg-${msg.id}`,
        type: 'MESSAGE_SENT',
        title: 'إضافة محادثة / ملاحظة',
        actorName: msg.author?.name || 'مستخدم',
        date: msg.createdAt.toISOString(),
        details: msg.body.substring(0, 80)
      });
    }

    // Sort all events chronologically (latest first)
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(events);

  } catch (error: any) {
    console.error('Error fetching matter timeline:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الخط الزمني للمشروع.' }, { status: 500 });
  }
}
