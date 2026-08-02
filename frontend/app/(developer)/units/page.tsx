import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import UnitsDashboard from './UnitsDashboard';

export const metadata = { title: 'المخزون والوحدات العقارية — رُسوخ' };

export default async function UnitsPage() {
  const store = cookies();
  const tenantId = store.get('tenantId')?.value;

  if (!tenantId) {
    return <div className="p-8 text-slate-400">الرجاء تسجيل الدخول...</div>;
  }

  const properties = await prisma.property.findMany({
    where: { tenantId },
    include: {
      units: true,
      manager: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <main className="rusukh-page pb-20">
      <UnitsDashboard properties={properties} />
    </main>
  );
}
