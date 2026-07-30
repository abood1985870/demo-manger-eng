export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({
        matters: [],
        clients: [],
        documents: [],
        tasks: [],
        hearings: []
      });
    }

    const tenantId = session.tenantId;

    // Concurrent DB Search Queries filtered by tenantId
    const [matters, clients, documents, tasks, hearings] = await Promise.all([
      // 1. Search Matters
      prisma.matter.findMany({
        where: {
          tenantId,
          OR: [
            { title: { contains: q } },
            { caseNumber: { contains: q } },
            { externalPartyName: { contains: q } },
            { notes: { contains: q } }
          ]
        },
        select: {
          id: true,
          title: true,
          caseNumber: true,
          status: true,
          createdAt: true,
          client: { select: { name: true } }
        },
        take: 10
      }),

      // 2. Search Clients
      prisma.client.findMany({
        where: {
          tenantId,
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
        take: 10
      }),

      // 3. Search Documents
      prisma.document.findMany({
        where: {
          matter: { tenantId },
          title: { contains: q }
        },
        select: {
          id: true,
          title: true,
          type: true,
          matterId: true,
          createdAt: true,
          matter: { select: { title: true } }
        },
        take: 10
      }),

      // 4. Search Tasks
      prisma.task.findMany({
        where: {
          tenantId,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } }
          ]
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          matterId: true,
          matter: { select: { title: true } }
        },
        take: 10
      }),

      // 5. Search Hearings
      prisma.hearing.findMany({
        where: {
          tenantId,
          OR: [
            { title: { contains: q } },
            { court: { contains: q } },
            { summary: { contains: q } }
          ]
        },
        select: {
          id: true,
          title: true,
          court: true,
          date: true,
          matterId: true,
          matter: { select: { title: true } }
        },
        take: 10
      })
    ]);

    return NextResponse.json({
      query: q,
      results: {
        matters,
        clients,
        documents,
        tasks,
        hearings
      }
    });

  } catch (error: any) {
    console.error('Error performing global search:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تنفيذ البحث الشامل.' }, { status: 500 });
  }
}
