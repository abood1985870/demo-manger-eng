import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role.toLowerCase() !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true }
    });

    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    return NextResponse.json(admin);
  } catch (error) {
    console.error('Failed to fetch admin profile', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role.toLowerCase() !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, email, password } = data;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No data provided to update' }, { status: 400 });
    }

    const updatedAdmin = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { id: true, name: true, email: true }
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error('Failed to update admin profile', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
