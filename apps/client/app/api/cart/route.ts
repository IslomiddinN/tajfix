import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json([], { status: 404 });
  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true }
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
  const body = await request.json();
  const { productId, quantity } = body;
  if (!productId || !quantity || quantity < 1) {
    return NextResponse.json({ message: 'Неверные данные' }, { status: 400 });
  }
  const existing = await prisma.cartItem.findFirst({ where: { userId: user.id, productId } });
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity }
    });
  } else {
    await prisma.cartItem.create({
      data: { userId: user.id, productId, quantity }
    });
  }
  return NextResponse.json({ success: true });
}
