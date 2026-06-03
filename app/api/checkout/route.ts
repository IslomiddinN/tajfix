import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { notifyTelegram, formatNewOrder } from '@/lib/notify';
import { enforceRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Не более 10 оформлений с одного IP за минуту.
  const limited = enforceRateLimit(request, 'checkout', 10, 60_000);
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });

  const body = await request.json();
  const address = typeof body.address === 'string' ? body.address.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (!address || !phone) {
    return NextResponse.json({ message: 'Укажите адрес и телефон' }, { status: 400 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true }
  });
  if (cartItems.length === 0) {
    return NextResponse.json({ message: 'Корзина пуста' }, { status: 400 });
  }

  // Проверяем наличие на складе до создания заказа.
  const insufficient = cartItems.filter((item) => item.quantity > item.product.stock);
  if (insufficient.length > 0) {
    return NextResponse.json(
      {
        message: 'Недостаточно товара на складе',
        items: insufficient.map((i) => ({
          title: i.product.title,
          requested: i.quantity,
          available: i.product.stock
        }))
      },
      { status: 409 }
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Создание заказа, списание остатков и очистка корзины — атомарно.
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.productOrder.create({
      data: {
        userId: user.id,
        totalAmount,
        status: 'NEW',
        address,
        phone,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      }
    });

    for (const item of cartItems) {
      // Условное списание: decrement только если остаток ещё достаточен,
      // чтобы защититься от гонки между двумя одновременными заказами.
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } }
      });
      if (updated.count === 0) {
        throw new Error(`OUT_OF_STOCK:${item.product.title}`);
      }
    }

    await tx.cartItem.deleteMany({ where: { userId: user.id } });
    return created;
  }).catch((err: Error) => {
    if (err.message?.startsWith('OUT_OF_STOCK:')) {
      return null;
    }
    throw err;
  });

  if (!order) {
    return NextResponse.json(
      { message: 'Товар закончился во время оформления. Обновите корзину.' },
      { status: 409 }
    );
  }

  // Уведомляем продавца (не блокирует ответ при сбое).
  await notifyTelegram(
    formatNewOrder({
      orderId: order.id,
      customerName: user.name,
      phone,
      address,
      total: totalAmount,
      items: cartItems.map((i) => ({
        title: i.product.title,
        quantity: i.quantity,
        price: i.product.price
      }))
    })
  );

  return NextResponse.json(order);
}
