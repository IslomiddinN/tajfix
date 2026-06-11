import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSeller } from '@/lib/seller';

export const dynamic = 'force-dynamic';

// Возвращает профиль текущего продавца. Зеркало master/profile, но для магазина.
export async function GET() {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  return NextResponse.json(seller);
}

export async function PATCH(request: Request) {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }

  const body = await request.json();
  const data: { shopName?: string; phone?: string; description?: string; logoUrl?: string } = {};

  // shopName и phone обязательны — пустые значения игнорируем.
  for (const key of ['shopName', 'phone'] as const) {
    const value = body[key];
    if (typeof value === 'string' && value.trim()) {
      data[key] = value.trim();
    }
  }

  // description и logoUrl могут быть очищены до пустой строки.
  for (const key of ['description', 'logoUrl'] as const) {
    const value = body[key];
    if (typeof value === 'string') {
      data[key] = value.trim();
    }
  }

  const updated = await prisma.seller.update({ where: { id: seller.id }, data });
  return NextResponse.json(updated);
}
