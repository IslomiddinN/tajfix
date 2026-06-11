import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSeller } from '@/lib/seller';

export const dynamic = 'force-dynamic';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-я\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET() {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const body = await request.json();
  const { title, description, brand, categoryId, price, imageUrl } = body;
  if (!title || !description || !brand || !categoryId || price == null || !imageUrl) {
    return NextResponse.json({ message: 'Заполните обязательные поля' }, { status: 400 });
  }
  const slug = (body.slug && slugify(body.slug)) || `${slugify(title)}-${Date.now().toString(36)}`;
  try {
    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        brand,
        categoryId,
        sellerId: seller.id,
        price: Number(price),
        oldPrice: body.oldPrice != null && body.oldPrice !== '' ? Number(body.oldPrice) : null,
        discountPercent:
          body.discountPercent != null && body.discountPercent !== '' ? Number(body.discountPercent) : null,
        imageUrl,
        rating: body.rating != null && body.rating !== '' ? Number(body.rating) : 0,
        stock: body.stock != null && body.stock !== '' ? Number(body.stock) : 0,
        isHit: Boolean(body.isHit),
        isNew: Boolean(body.isNew)
      }
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ message: 'Товар с таким slug уже существует' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Ошибка создания товара' }, { status: 500 });
  }
}
