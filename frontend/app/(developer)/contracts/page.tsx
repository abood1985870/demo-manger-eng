import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import ContractsBoard from './ContractsBoard';
import { redirect } from 'next/navigation';

export const metadata = { title: 'إدارة العقود (CLM) — رُسوخ' };

export default async function ContractsPage() {
  const store = cookies();
  const tenantId = store.get('tenantId')?.value;

  if (!tenantId) {
    redirect('/login');
  }

  // Fetch templates
  const templates = await prisma.contractTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch contracts
  const contracts = await prisma.contract.findMany({
    where: { tenantId },
    include: {
      client: true,
      lead: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch active leads for generation
  const leads = await prisma.lead.findMany({
    where: { tenantId, status: { not: 'SOLD' } },
  });

  return (
    <main className="rusukh-page pb-20">
      <ContractsBoard templates={templates} contracts={contracts} leads={leads} />
    </main>
  );
}
