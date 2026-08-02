import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import CrmBoard from './CrmBoard';

export const metadata = { title: 'المبيعات والعملاء | رُسوخ' };

export default async function CrmPage() {
  const store = await cookies();
  const tenantId = store.get('tenantId')?.value;

  if (!tenantId) {
    return <div className="p-8 text-slate-400">الرجاء تسجيل الدخول للوصول إلى المبيعات...</div>;
  }

  const leads = await prisma.lead.findMany({
    where: { tenantId },
    include: {
      property: true
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="rusukh-page pb-12 bg-slate-950 h-[calc(100vh-64px)] flex flex-col">
      <CrmBoard leads={leads} />
    </main>
  );
}
