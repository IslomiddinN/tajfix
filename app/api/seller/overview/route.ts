import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSeller } from '@/lib/seller';

export const dynamic = 'force-dynamic';

export async function GET() {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }

  const [productsCount, items] = await Promise.all([
    prisma.product.count({ where: { sellerId: seller.id } }),
    prisma.productOrderItem.findMany({
      where: { product: { sellerId: seller.id } },
      select: {
        quantity: true,
        price: true,
        fulfilled: true,
        orderId: true,
        order: { select: { status: true } }
      }
    })
  ]);

  const orderIds = new Set(items.map((i) => i.orderId));
  const revenue = items
    .filter((i) => i.order.status === 'COMPLETED')
    .reduce((sum, i) => sum + i.price * i.quantity, 0);
  const pendingItems = items.filter(
    (i) => !i.fulfilled && i.order.status !== 'CANCELLED' && i.order.status !== 'COMPLETED'
  ).length;

  return NextResponse.json({
    seller,
    stats: {
      productsCount,
      ordersCount: orderIds.size,
      revenue,
      pendingItems
    }
  });
}
