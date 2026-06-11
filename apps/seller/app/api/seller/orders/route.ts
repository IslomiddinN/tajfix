import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSeller } from '@/lib/seller';

export const dynamic = 'force-dynamic';

/**
 * Returns the seller's own order items (positions of their products only),
 * each with its parent order context. An order may contain items from several
 * sellers — the seller sees only the positions that belong to them.
 */
export async function GET() {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const items = await prisma.productOrderItem.findMany({
    where: { product: { sellerId: seller.id } },
    orderBy: { order: { createdAt: 'desc' } },
    include: {
      product: { select: { id: true, title: true, imageUrl: true } },
      order: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          address: true,
          phone: true,
          user: { select: { name: true } }
        }
      }
    }
  });
  return NextResponse.json(items);
}
