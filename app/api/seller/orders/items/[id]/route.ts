import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSeller } from '@/lib/seller';

export const dynamic = 'force-dynamic';

interface Params {
  params: { id: string };
}

/**
 * Toggles the per-position fulfillment flag (готовность к отгрузке). The seller
 * can only update items belonging to their own products; the overall order
 * status stays under admin control.
 */
export async function PATCH(request: Request, { params }: Params) {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const item = await prisma.productOrderItem.findUnique({
    where: { id: params.id },
    include: { product: { select: { sellerId: true } } }
  });
  if (!item || item.product.sellerId !== seller.id) {
    return NextResponse.json({ message: 'Позиция не найдена' }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const fulfilled = Boolean(body.fulfilled);
  const updated = await prisma.productOrderItem.update({
    where: { id: params.id },
    data: { fulfilled }
  });
  return NextResponse.json(updated);
}
