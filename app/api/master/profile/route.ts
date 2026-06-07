import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.role !== 'MASTER') {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const master = await prisma.master.findUnique({ where: { userId: session.user.id } });
  if (!master) {
    return NextResponse.json({ message: 'Профиль мастера не найден' }, { status: 404 });
  }
  const body = await request.json();
  const data: {
    isAvailable?: boolean;
    phone?: string;
    name?: string;
    specialization?: string;
    description?: string;
    guaranteeText?: string;
    avatarUrl?: string;
    priceFrom?: number;
  } = {};

  if (typeof body.isAvailable === 'boolean') data.isAvailable = body.isAvailable;

  const strFields: Array<keyof typeof data> = ['phone', 'name', 'specialization', 'description', 'guaranteeText', 'avatarUrl'];
  for (const key of strFields) {
    const value = body[key];
    if (typeof value === 'string' && value.trim()) {
      // @ts-expect-error narrowed to string keys
      data[key] = value.trim();
    }
  }

  if (body.priceFrom != null && body.priceFrom !== '' && !Number.isNaN(Number(body.priceFrom))) {
    data.priceFrom = Math.max(0, Math.round(Number(body.priceFrom)));
  }

  const updated = await prisma.master.update({ where: { id: master.id }, data });
  return NextResponse.json(updated);
}
