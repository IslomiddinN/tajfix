import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

interface Params {
  params: { id: string };
}

function num(value: unknown, fallback: number) {
  return value != null && value !== '' ? Number(value) : fallback;
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const existing = await prisma.master.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ message: 'Мастер не найден' }, { status: 404 });
  const body = await request.json();
  const master = await prisma.master.update({
    where: { id: params.id },
    data: {
      name: body.name ?? existing.name,
      phone: body.phone ?? existing.phone,
      specialization: body.specialization ?? existing.specialization,
      description: body.description ?? existing.description,
      avatarUrl: body.avatarUrl ?? existing.avatarUrl,
      rating: num(body.rating, existing.rating),
      reviewsCount: num(body.reviewsCount, existing.reviewsCount),
      distanceKm: num(body.distanceKm, existing.distanceKm),
      priceFrom: num(body.priceFrom, existing.priceFrom),
      guaranteeText: body.guaranteeText ?? existing.guaranteeText,
      isAvailable: 'isAvailable' in body ? Boolean(body.isAvailable) : existing.isAvailable
    }
  });
  return NextResponse.json(master);
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  try {
    await prisma.master.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      return NextResponse.json({ message: 'Нельзя удалить: у мастера есть заявки' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Ошибка удаления мастера' }, { status: 500 });
  }
}
