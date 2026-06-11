import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]
  });
  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const address = typeof body?.address === 'string' ? body.address.trim() : '';
  const label = typeof body?.label === 'string' ? body.label.trim() : '';
  const isDefault = body?.isDefault === true;

  if (!address) {
    return NextResponse.json({ message: 'Введите адрес' }, { status: 400 });
  }

  // Первый адрес автоматически становится адресом по умолчанию.
  const count = await prisma.address.count({ where: { userId: session.user.id } });
  const makeDefault = isDefault || count === 0;

  const created = await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: { userId: session.user.id, address, label, isDefault: makeDefault }
    });
  });

  return NextResponse.json(created, { status: 201 });
}
