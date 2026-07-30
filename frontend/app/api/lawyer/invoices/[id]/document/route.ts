import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] || character));
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession('billing');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({ where: { id, tenantId: session.tenantId }, include: { client: true, matter: true } });
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  const amount = Number(invoice.amount);
  const vat = amount * 0.15;
  const total = amount + vat;
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>فاتورة ${escapeHtml(invoice.id.slice(0, 8))}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#172033}header{display:flex;justify-content:space-between;border-bottom:2px solid #d49a2a;padding-bottom:20px}table{width:100%;border-collapse:collapse;margin-top:30px}td,th{border:1px solid #ddd;padding:12px;text-align:right}.total{font-size:20px;font-weight:bold;color:#a66c00}@media print{button{display:none}}</style></head><body><header><div><h1>فاتورة خدمات إدارة وتطوير عقاري</h1><p>رقم الفاتورة: ${escapeHtml(invoice.id)}</p></div><div><p>الحالة: ${escapeHtml(invoice.status)}</p><p>تاريخ الإصدار: ${invoice.createdAt.toISOString().slice(0, 10)}</p></div></header><main><p><strong>العميل:</strong> ${escapeHtml(invoice.client.name)}</p><p><strong>المشروع:</strong> ${escapeHtml(invoice.matter?.title || 'غير مرتبطة بمشروع')}</p><table><thead><tr><th>الوصف</th><th>المبلغ</th></tr></thead><tbody><tr><td>خدمات إدارة وتطوير عقاري</td><td>${amount.toFixed(2)} ر.س</td></tr><tr><td>ضريبة القيمة المضافة (15%)</td><td>${vat.toFixed(2)} ر.س</td></tr><tr><td class="total">الإجمالي</td><td class="total">${total.toFixed(2)} ر.س</td></tr></tbody></table></main><button onclick="window.print()">طباعة / حفظ PDF</button></body></html>`;
  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': `inline; filename="invoice-${invoice.id.slice(0, 8)}.html"` } });
}
