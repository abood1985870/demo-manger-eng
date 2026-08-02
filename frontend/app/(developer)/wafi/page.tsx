import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import WafiDashboard from './WafiDashboard';

export const metadata = { title: 'نظام وافي — البيع على الخارطة | رُسوخ' };

export default async function WafiPage() {
  const store = await cookies();
  const tenantId = store.get('tenantId')?.value;

  if (!tenantId) {
    return <div className="p-8 text-slate-400">الرجاء تسجيل الدخول...</div>;
  }

  const properties = await prisma.property.findMany({
    where: { tenantId },
    include: {
      WafiEscrowAccount: true,
      WafiProgressReport: {
        orderBy: { reportDate: 'desc' }
      }
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <main className="rusukh-page pb-20">
      <WafiDashboard properties={properties} />
    </main>
  );
}
