import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) return console.log('No tenant found');
  
  await prisma.property.deleteMany({ where: { tenantId: tenant.id } });

  const tower = await prisma.property.create({
    data: {
      tenantId: tenant.id,
      name: 'برج رسوخ السكني الفاخر',
      type: 'BUILDING',
      location: 'الرياض - حي العليا',
      totalArea: 12000,
      wafiLicenseNumber: 'W-99281',
      units: {
        create: [
          { tenantId: tenant.id, unitNumber: '101', type: 'APARTMENT', area: 150, price: 1850000, status: 'AVAILABLE' },
          { tenantId: tenant.id, unitNumber: '102', type: 'APARTMENT', area: 120, price: 1500000, status: 'SOLD' },
          { tenantId: tenant.id, unitNumber: 'PH-1', type: 'APARTMENT', area: 450, price: 6500000, status: 'RESERVED' },
          { tenantId: tenant.id, unitNumber: 'PH-2', type: 'APARTMENT', area: 450, price: 6500000, status: 'AVAILABLE' },
        ]
      }
    }
  });

  const villa = await prisma.property.create({
    data: {
      tenantId: tenant.id,
      name: 'مجمع واحة النخيل',
      type: 'COMPOUND',
      location: 'الرياض - حي النخيل',
      totalArea: 50000,
      wafiLicenseNumber: 'W-77112',
      status: 'UNDER_CONSTRUCTION',
      units: {
        create: [
          { tenantId: tenant.id, unitNumber: 'V-01', type: 'VILLA', area: 550, price: 4200000, status: 'SOLD' },
          { tenantId: tenant.id, unitNumber: 'V-02', type: 'VILLA', area: 550, price: 4200000, status: 'RESERVED' },
          { tenantId: tenant.id, unitNumber: 'V-03', type: 'VILLA', area: 700, price: 5800000, status: 'AVAILABLE' },
          { tenantId: tenant.id, unitNumber: 'V-04', type: 'VILLA', area: 700, price: 5800000, status: 'AVAILABLE' },
          { tenantId: tenant.id, unitNumber: 'V-05', type: 'VILLA', area: 850, price: 7500000, status: 'AVAILABLE' },
        ]
      }
    }
  });

  const masterplan = await prisma.property.create({
    data: {
      tenantId: tenant.id,
      name: 'مخطط روشن الحضري',
      type: 'MASTER_PLAN',
      location: 'شمال الرياض',
      totalArea: 2500000,
      wafiLicenseNumber: 'W-11005',
      status: 'PLANNING',
      units: {
        create: [
          { tenantId: tenant.id, unitNumber: 'L-101', type: 'LAND', area: 900, price: 1800000, status: 'SOLD' },
          { tenantId: tenant.id, unitNumber: 'L-102', type: 'LAND', area: 900, price: 1800000, status: 'SOLD' },
          { tenantId: tenant.id, unitNumber: 'L-103', type: 'LAND', area: 1200, price: 2400000, status: 'RESERVED' },
          { tenantId: tenant.id, unitNumber: 'L-104', type: 'LAND', area: 1200, price: 2400000, status: 'AVAILABLE' },
          { tenantId: tenant.id, unitNumber: 'L-105', type: 'LAND', area: 1500, price: 3000000, status: 'AVAILABLE' },
          { tenantId: tenant.id, unitNumber: 'L-106', type: 'LAND', area: 1500, price: 3000000, status: 'AVAILABLE' },
          { tenantId: tenant.id, unitNumber: 'C-01', type: 'RETAIL', area: 5000, price: 15000000, status: 'AVAILABLE' },
        ]
      }
    }
  });

  console.log('Seeded professional properties successfully');
}
main().catch(console.error).finally(() => prisma.$disconnect());
