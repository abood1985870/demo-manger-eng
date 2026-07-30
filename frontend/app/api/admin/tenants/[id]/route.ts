import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session || session.role.toLowerCase() !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subscriptionStatus } = await request.json();
    
    if (subscriptionStatus !== 'active' && subscriptionStatus !== 'suspended') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: { subscriptionStatus }
    });

    return NextResponse.json(tenant);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}
