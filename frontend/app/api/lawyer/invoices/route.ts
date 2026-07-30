export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession('billing');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId: session.tenantId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        client: true,
        matter: true
      }
    });
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession('billing');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, matterId, amount, dueDate } = await request.json();

    if (!clientId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await prisma.client.findFirst({ where: { id: clientId, tenantId: session.tenantId } });
    if (!client) return NextResponse.json({ error: 'Client not found or unauthorized' }, { status: 404 });
    if (matterId) {
      const matter = await prisma.matter.findFirst({ where: { id: matterId, tenantId: session.tenantId } });
      if (!matter) return NextResponse.json({ error: 'Matter not found or unauthorized' }, { status: 404 });
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        tenantId: session.tenantId,
        clientId,
        matterId: matterId || null,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        client: true
      }
    });

    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
