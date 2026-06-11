import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSeller } from '@/lib/seller';

export const dynamic = 'force-dynamic';

interface Params {
  params: { id: string };
}

function num(value: unknown) {
  return value != null && value !== '' ? Number(value) : null;
}

export async function PATCH(request: Request, { params }: Params) {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing || existing.sellerId !== seller.id) {
    return NextResponse.json({ message: 'Товар не найден' }, { status: 404 });
  }
  const body = await request.json();
  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        brand: body.brand ?? existing.brand,
        categoryId: body.categoryId ?? existing.categoryId,
        price: body.price != null && body.price !== '' ? Number(body.price) : existing.price,
        oldPrice: 'oldPrice' in body ? num(body.oldPrice) : existing.oldPrice,
        discountPercent: 'discountPercent' in body ? num(body.discountPercent) : existing.discountPercent,
        imageUrl: body.imageUrl ?? existing.imageUrl,
        rating: body.rating != null && body.rating !== '' ? Number(body.rating) : existing.rating,
        stock: body.stock != null && body.stock !== '' ? Number(body.stock) : existing.stock,
        isHit: 'isHit' in body ? Boolean(body.isHit) : existing.isHit,
        isNew: 'isNew' in body ? Boolean(body.isNew) : existing.isNew
      }
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ message: 'Ошибка обновления товара' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing || existing.sellerId !== seller.id) {
    return NextResponse.json({ message: 'Товар не найден' }, { status: 404 });
  }
  try {
    await prisma.cartItem.deleteMany({ where: { productId: params.id } });
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      return NextResponse.json({ message: 'Нельзя удалить: товар используется в заказах' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Ошибка удаления товара' }, { status: 500 });
  }
}
