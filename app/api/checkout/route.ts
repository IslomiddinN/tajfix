import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
  const body = await request.json();
  const { address, phone } = body;
  if (!address || !phone) {
    return NextResponse.json({ message: 'Неверные данные' }, { status: 400 });
  }
  const cartItems = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
  if (cartItems.length === 0) {
    return NextResponse.json({ message: 'Корзина пуста' }, { status: 400 });
  }
  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const order = await prisma.productOrder.create({
    data: {
      userId: user.id,
      totalAmount,
      status: 'NEW',
      address,
      phone,
      items: {
        create: cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.product.price }))
      }
    }
  });
  await prisma.cartItem.deleteMany({ where: { userId: user.id } });
  return NextResponse.json(order);
}
