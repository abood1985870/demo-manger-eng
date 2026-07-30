import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession('clients');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.tenantId;

    const clients = await prisma.client.findMany({
      where: {
        tenantId: tenantId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: { matters: true, beneficiaryMatters: true, invoices: true, contracts: true }
        },
        beneficiaryMatters: { select: { id: true, title: true, caseNumber: true, status: true }, orderBy: { createdAt: 'desc' } },
      }
    });
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession('clients');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, type } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newClient = await prisma.client.create({
      data: {
        tenantId: session.tenantId, // Securely pulled from session
        name,
        email,
        phone,
        type: type || 'individual',
      }
    });

    return NextResponse.json(newClient);
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
