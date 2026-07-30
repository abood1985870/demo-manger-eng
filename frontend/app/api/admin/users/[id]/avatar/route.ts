export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { storeAvatar, deleteStoredAvatar, validateAvatarFile } from '@/lib/avatar-storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = session.role.toLowerCase();
    const isSuperAdmin = role === 'superadmin';
    const isOwnerOrAdmin = role === 'admin' || role === 'owner';

    if (!isSuperAdmin && !isOwnerOrAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check tenant isolation
    if (!isSuperAdmin && user.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Admins cannot edit superadmin's avatar (unless they are superadmin)
    if (!isSuperAdmin && user.role.toLowerCase() === 'superadmin') {
      return NextResponse.json({ error: 'Cannot modify superadmin' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 });
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { storageKey } = await storeAvatar(user.tenantId, user.id, buffer);

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: storageKey }
      });
      
      // Delete old avatar if it exists
      if (user.avatarUrl) {
        await deleteStoredAvatar(user.avatarUrl).catch(e => console.error('Failed to delete old avatar:', e));
      }

      return NextResponse.json({ success: true, avatarUrl: storageKey });
    } catch (error) {
      await deleteStoredAvatar(storageKey).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error('Failed to upload avatar as admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = session.role.toLowerCase();
    const isSuperAdmin = role === 'superadmin';
    const isOwnerOrAdmin = role === 'admin' || role === 'owner';

    if (!isSuperAdmin && !isOwnerOrAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.avatarUrl) return NextResponse.json({ error: 'No avatar found' }, { status: 404 });

    // Check tenant isolation
    if (!isSuperAdmin && user.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!isSuperAdmin && user.role.toLowerCase() === 'superadmin') {
      return NextResponse.json({ error: 'Cannot modify superadmin' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: null }
    });

    await deleteStoredAvatar(user.avatarUrl).catch(e => console.error('Failed to delete avatar file:', e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete avatar as admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
