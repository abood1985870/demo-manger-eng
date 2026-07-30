import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;
    const session = await getSession('documents');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const template = await prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json({ error: 'القالب غير موجـود' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (template.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا القالب' }, { status: 403 });
    }

    // Manager / Admin check
    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    if (!isManager) {
      return NextResponse.json({ error: 'صلاحية تعديل القوالب التطويرية تقتصر على مدير الشركة أو مسؤول النظام' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, practiceArea, templateType, content, isActive } = body;

    const updatedTemplate = await prisma.documentTemplate.update({
      where: { id: templateId },
      data: {
        title: title !== undefined ? title.trim() : template.title,
        description: description !== undefined ? description : template.description,
        practiceArea: practiceArea !== undefined ? practiceArea : template.practiceArea,
        templateType: templateType !== undefined ? templateType : template.templateType,
        category: templateType !== undefined ? templateType : template.category,
        content: content !== undefined ? content : template.content,
        isActive: isActive !== undefined ? Boolean(isActive) : template.isActive,
        updatedById: session.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } }
      }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'LEGAL_TEMPLATE_UPDATE',
      entityType: 'DocumentTemplate',
      entityId: updatedTemplate.id,
      metadata: { title: updatedTemplate.title, isActive: updatedTemplate.isActive },
      req: request,
    });

    return NextResponse.json(updatedTemplate);

  } catch (error: any) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث القالب.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;
    const session = await getSession('documents');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const template = await prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json({ error: 'القالب غير موجـود' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (template.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك بحذف هذا القالب' }, { status: 403 });
    }

    // Manager / Admin check
    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    if (!isManager) {
      return NextResponse.json({ error: 'صلاحية حذف القوالب التطويرية تقتصر على مدير الشركة أو مسؤول النظام' }, { status: 403 });
    }

    await prisma.documentTemplate.delete({
      where: { id: templateId }
    });

    // Record Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'LEGAL_TEMPLATE_DELETE',
      entityType: 'DocumentTemplate',
      entityId: templateId,
      metadata: { deletedTitle: template.title },
      req: request,
    });

    return NextResponse.json({ success: true, message: 'تم حذف القالب بنجاح' });

  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف القالب.' }, { status: 500 });
  }
}
