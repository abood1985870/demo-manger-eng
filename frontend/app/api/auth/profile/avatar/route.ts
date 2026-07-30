import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { storeAvatar, deleteStoredAvatar, validateAvatarFile } from '@/lib/avatar-storage';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 });
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 415 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const { storageKey } = await storeAvatar(session.tenantId, session.userId, buffer);

    try {
      await prisma.user.update({
        where: { id: session.userId },
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
    console.error('Failed to upload avatar:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !user.avatarUrl) return NextResponse.json({ error: 'No avatar found' }, { status: 404 });

    await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: null }
    });

    await deleteStoredAvatar(user.avatarUrl).catch(e => console.error('Failed to delete avatar file:', e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete avatar:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
