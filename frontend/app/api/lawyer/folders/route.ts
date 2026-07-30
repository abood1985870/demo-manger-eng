import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hasPermission } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { validateActiveTenantUsers } from '@/lib/matter-access';

export async function GET(request: Request) {
  try {
    const session = await getSession('projects');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    
    // Visibility rules: Creator, Viewer, or Manager
    const whereClause = isManager 
      ? { tenantId: session.tenantId }
      : {
          tenantId: session.tenantId,
          OR: [
            { createdById: session.userId },
            { viewers: { some: { id: session.userId } } }
          ]
        };

    const folders = await prisma.caseFolder.findMany({
      where: whereClause,
      include: {
        viewers: { select: { id: true, name: true, email: true, role: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error('Failed to fetch folders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession('projects');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    
    if (!name) return NextResponse.json({ error: 'اسم المجلد مطلوب' }, { status: 400 });
    if (name.length > 100) return NextResponse.json({ error: 'اسم المجلد أطول من المسموح (100 حرف)' }, { status: 400 });

    // Enforce uniqueness within the tenant
    const existing = await prisma.caseFolder.findFirst({
      where: {
        tenantId: session.tenantId,
        name: {
          equals: name
        } // In Postgres this might need insensitive check, but equals is standard
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'يوجد مجلد آخر بنفس الاسم' }, { status: 400 });
    }

    const viewerIds = Array.isArray(data.viewerIds) ? data.viewerIds : [];
    const validViewers = viewerIds.length > 0 ? await validateActiveTenantUsers(session.tenantId, viewerIds) : [];
    const validViewerIds = validViewers?.map(u => u.id) || [];
    
    // Ensure creator is not duplicated in viewers
    const finalViewerIds = Array.from(new Set(validViewerIds)).filter(id => id !== session.userId);

    const folder = await prisma.caseFolder.create({
      data: {
        tenantId: session.tenantId,
        name,
        createdById: session.userId,
        viewers: {
          connect: finalViewerIds.map(id => ({ id }))
        }
      },
      include: {
        viewers: { select: { id: true, name: true, email: true, role: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      }
    });

    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'casefolder.created',
      entityType: 'CaseFolder',
      entityId: folder.id,
      metadata: { name: folder.name, viewersCount: finalViewerIds.length }
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Failed to create folder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
