export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { readStoredAvatar } from '@/lib/avatar-storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true, tenantId: true }
    });

    if (!user || !user.avatarUrl) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Ensure the requester is in the same tenant, or is superadmin
    if (session.tenantId !== user.tenantId && session.role.toLowerCase() !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const buffer = await readStoredAvatar(user.avatarUrl);
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('Failed to fetch avatar:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
