import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getMatterForAuthorizedUser } from '@/lib/matter-access';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const matter = await getMatterForAuthorizedUser(session, id);
  if (!matter) return NextResponse.json({ error: 'Matter not found or access denied' }, { status: 404 });
  const ids = Array.from(new Set([matter.lawyerId, ...matter.teamMembers.map((member) => member.id)].filter(Boolean))) as string[];
  const members = await prisma.user.findMany({ where: { id: { in: ids }, tenantId: session.tenantId, isActive: true }, select: { id: true, name: true, role: true, avatarUrl: true }, orderBy: { name: 'asc' } });
  return NextResponse.json(members);
}
