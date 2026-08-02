import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import VipPitchClient from './VipPitchClient';

export async function generateMetadata({ params }: { params: { propertyId: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
    select: { name: true },
  });
  return {
    title: property ? `عرض استثماري حصري | ${property.name}` : 'عرض استثماري',
  };
}

export default async function VipPitchPage({ params }: { params: { propertyId: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
    include: {
      Unit: true,
      Tenant: true,
    },
  });

  if (!property) return notFound();

  // Calculate stats for the pitch deck
  const totalUnits = property.Unit.length;
  const availableUnits = property.Unit.filter(u => u.status === 'AVAILABLE');
  const soldUnitsCount = totalUnits - availableUnits.length;
  const averagePrice = availableUnits.length > 0 
    ? availableUnits.reduce((acc, curr) => acc + (curr.price || 0), 0) / availableUnits.length
    : 0;

  return (
    <VipPitchClient 
      property={property} 
      availableUnitsCount={availableUnits.length}
      soldUnitsCount={soldUnitsCount}
      averagePrice={averagePrice}
    />
  );
}
