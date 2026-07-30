export const dynamic = 'force-dynamic';
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
    const session = await getSession('reports');
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: {
        client: true,
        beneficiaryAccount: true,
        lawyer: { select: { id: true, name: true, email: true } },
        teamMembers: { select: { id: true, name: true } },
        documents: { orderBy: { createdAt: 'desc' } },
        hearings: { orderBy: { date: 'asc' } },
        tasks: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
        statusHistory: { include: { changedBy: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      }
    });

    if (!matter) {
      return NextResponse.json({ error: 'المشروع غير موجـودة' }, { status: 404 });
    }

    // Strict Tenant Isolation check
    if (matter.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'غير مصرح لك باستخراج تقرير هذه المشروع' }, { status: 403 });
    }

    const statusText = MATTER_STATUS_ARABIC[matter.status as MatterStatus] || matter.status;
    const isArchived = (matter as any).isArchived === true;

    // Generate Printable Arabic PDF-optimized HTML Report
    const htmlReport = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>تقرير مشروع - ${matter.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    body {
      font-family: 'Cairo', sans-serif;
      background-color: #ffffff;
      color: #1e293b;
      margin: 0;
      padding: 30px;
      direction: rtl;
      text-align: right;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #d97706;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .logo-title h1 {
      margin: 0;
      font-size: 24px;
      color: #0f172a;
    }
    .logo-title p {
      margin: 5px 0 0 0;
      font-size: 12px;
      color: #64748b;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }
    .badge-archived {
      background-color: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 25px;
      margin-bottom: 12px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .info-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px 16px;
      border-radius: 8px;
    }
    .info-box label {
      display: block;
      font-size: 11px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .info-box span {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      text-align: right;
    }
    th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 700;
    }
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: left;">
    <button onclick="window.print()" style="background-color: #d97706; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: Cairo;">🖨️ طباعة / حفظ كـ PDF</button>
  </div>

  <div class="header-bar">
    <div class="logo-title">
      <h1>تقرير مشروع رسمية</h1>
      <p>رُسوخ — منصة قيادة التطوير العقاري</p>
    </div>
    <div>
      <span class="badge ${isArchived ? 'badge-archived' : ''}">
        ${isArchived ? 'مؤرشفة' : statusText}
      </span>
    </div>
  </div>

  <div class="grid">
    <div class="info-box">
      <label>عنوان المشروع</label>
      <span>${matter.title}</span>
    </div>
    <div class="info-box">
      <label>رقم المشروع / الملف</label>
      <span>${matter.caseNumber || matter.id.substring(0, 8)}</span>
    </div>
    <div class="info-box">
      <label>العميل</label>
      <span>${matter.client?.name || matter.externalPartyName || 'غير محدد'}</span>
    </div>
    <div class="info-box">
      <label>الحساب المستفيد</label>
      <span>${matter.beneficiaryAccount?.name || 'غير محدد'}</span>
    </div>
    <div class="info-box">
      <label>مدير المشروع المسؤول</label>
      <span>${matter.lawyer?.name || 'غير محدد'}</span>
    </div>
    <div class="info-box">
      <label>تاريخ الإنشاء</label>
      <span>${new Date(matter.createdAt).toLocaleDateString('ar-SA')}</span>
    </div>
  </div>

  ${matter.notes ? `
  <div class="section-title">ملخص وملاحظات المشروع</div>
  <div class="info-box" style="white-space: pre-wrap;">${matter.notes}</div>
  ` : ''}

  ${isArchived ? `
  <div class="section-title">بيانات الأرشفة</div>
  <div class="info-box">
    <label>سبب وتاريخ الأرشفة</label>
    <span>${(matter as any).archiveReason || 'أرشفة إدارية'} (${new Date((matter as any).archivedAt).toLocaleDateString('ar-SA')})</span>
  </div>
  ` : ''}

  <div class="section-title">المواعيد والمراحل المرتبطة (${matter.hearings.length})</div>
  ${matter.hearings.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>الموعد / المرحلة</th>
        <th>الموقع / الجهة</th>
        <th>التاريخ والوقت</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${matter.hearings.map(h => `
        <tr>
          <td>${h.title || 'موعد مشروع'}</td>
          <td>${h.court}</td>
          <td>${new Date(h.date).toLocaleString('ar-SA')}</td>
          <td>${h.status || 'قائمة'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p style="font-size: 12px; color: #94a3b8;">لا توجد مواعيد مسجلة.</p>'}

  <div class="section-title">مهام المشروع المرتبطة (${matter.tasks.length})</div>
  ${matter.tasks.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>عنوان المهمة</th>
        <th>المسؤول</th>
        <th>الأولوية</th>
        <th>تاريخ الاستحقاق</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${matter.tasks.map(t => `
        <tr>
          <td>${t.title}</td>
          <td>${t.user?.name || 'غير محدد'}</td>
          <td>${t.priority === 'URGENT' ? 'عاجلة' : t.priority === 'HIGH' ? 'عالية' : 'عادية'}</td>
          <td>${t.dueDate ? new Date(t.dueDate).toLocaleDateString('ar-SA') : '-'}</td>
          <td>${t.isDone ? 'منجزة' : 'قيد التنفيذ'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p style="font-size: 12px; color: #94a3b8;">لا توجد مهام مسجلة.</p>'}

  <div class="section-title">المستندات والوثائق المرفقة (${matter.documents.length})</div>
  ${matter.documents.length > 0 ? `
  <ul>
    ${matter.documents.map(d => `
      <li style="font-size: 12px; margin-bottom: 4px;">${d.title} (تاريخ الرفع: ${new Date(d.createdAt).toLocaleDateString('ar-SA')})</li>
    `).join('')}
  </ul>
  ` : '<p style="font-size: 12px; color: #94a3b8;">لا توجد مستندات مرفقة.</p>'}

  <div class="footer">
    <p>تم استخراج هذا التقرير بتاريخ ${new Date().toLocaleString('ar-SA')} بواسطة منصة رُسوخ لإدارة التطوير العقاري.</p>
  </div>

  <script>
    window.onload = function() {
      // Auto open print modal when loaded
      window.print();
    };
  </script>
</body>
</html>
    `;

    return new NextResponse(htmlReport, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      }
    });

  } catch (error: any) {
    console.error('Error generating matter report:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تصدير تقرير المشروع.' }, { status: 500 });
  }
}
