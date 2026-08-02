import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import PitchDeckManager from './PitchDeckManager';

export const metadata = { title: 'عروض المستثمرين (VIP Pitch Decks) | رُسوخ' };

export default async function PitchDecksPage() {
  const store = cookies();
  const tenantId = store.get('tenantId')?.value;

  if (!tenantId) redirect('/login');

  const properties = await prisma.property.findMany({
    where: { tenantId },
    include: {
      units: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="rusukh-page pb-20">
      <PitchDeckManager properties={properties} />
    </main>
  );
}
