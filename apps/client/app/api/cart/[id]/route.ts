import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

interface Params {
  params: { id: string };
}

async function getOwnedItem(itemId: string, email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== user.id) return null;
  return item;
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const item = await getOwnedItem(params.id, session.user.email);
  if (!item) return NextResponse.json({ message: 'Товар не найден' }, { status: 404 });
  const body = await request.json();
  const quantity = Number(body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ message: 'Неверное количество' }, { status: 400 });
  }
  const updated = await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const item = await getOwnedItem(params.id, session.user.email);
  if (!item) return NextResponse.json({ message: 'Товар не найден' }, { status: 404 });
  await prisma.cartItem.delete({ where: { id: item.id } });
  return NextResponse.json({ success: true });
}
