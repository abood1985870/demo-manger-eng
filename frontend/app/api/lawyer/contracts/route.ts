import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession('contracts');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contracts = await prisma.contract.findMany({
      where: {
        tenantId: session.tenantId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        client: true
      }
    });
    
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Failed to fetch contracts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession('contracts');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, title, content, summary } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (clientId) {
      const client = await prisma.client.findFirst({ where: { id: clientId, tenantId: session.tenantId } });
      if (!client) return NextResponse.json({ error: 'Client not found or unauthorized' }, { status: 404 });
    }

    const newContract = await prisma.contract.create({
      data: {
        tenantId: session.tenantId,
        clientId: clientId || null,
        title,
        summary: summary || null,
        content: content || null,
      },
      include: {
        client: true
      }
    });

    return NextResponse.json(newContract);
  } catch (error) {
    console.error('Failed to create contract:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
