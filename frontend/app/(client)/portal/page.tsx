import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import ClientDashboard from './ClientDashboard';

export const metadata = { title: 'بوابة المستثمر | رُسوخ' };

export default async function ClientPortalPage() {
  // For demonstration, we will pick the VIP client we seeded
  const client = await prisma.client.findFirst({
    where: { name: 'عبدالله الراجحي (مستثمر VIP)' },
    include: {
      Unit: {
        include: {
          property: {
            include: {
              wafiProgressReports: {
                orderBy: { reportDate: 'desc' }
              }
            }
          }
        }
      },
      invoices: {
        orderBy: { dueDate: 'asc' }
      }
    }
  });

  if (!client) {
    return <div className="p-8 text-slate-400">جاري تحميل بيانات المستثمر... تأكد من تشغيل seed-clients.mjs</div>;
  }

  return (
    <ClientDashboard 
      client={client} 
      units={client.Unit} 
      invoices={client.invoices} 
    />
  );
}
