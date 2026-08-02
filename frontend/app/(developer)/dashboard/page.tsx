import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import ExecutiveDashboard from './ExecutiveDashboard';

export const metadata = { title: 'اللوحة التنفيذية | رُسوخ' };

export default async function DashboardPage() {
  const store = cookies();
  const tenantId = store.get('tenantId')?.value;

  if (!tenantId) {
    return <div className="p-8 text-slate-400">الرجاء تسجيل الدخول للوصول إلى اللوحة التنفيذية...</div>;
  }

  // Fetch real data for the dashboard
  const properties = await prisma.property.findMany({
    where: { tenantId },
    include: {
      wafiEscrowAccount: true,
      wafiProgressReports: {
        orderBy: { reportDate: 'desc' }
      },
      units: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const units = await prisma.unit.findMany({
    where: { tenantId }
  });

  const invoices = await prisma.invoice.findMany({
    where: { tenantId }
  });

  return (
    <main className="rusukh-page pb-20 bg-slate-950">
      <ExecutiveDashboard 
        properties={properties} 
        units={units} 
        invoices={invoices} 
      />
    </main>
  );
}
