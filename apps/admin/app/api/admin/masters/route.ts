import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const masters = await prisma.master.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(masters);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const body = await request.json();
  const { name, phone, specialization, description, avatarUrl } = body;
  if (!name || !phone || !specialization || !description || !avatarUrl) {
    return NextResponse.json({ message: 'Заполните обязательные поля' }, { status: 400 });
  }
  const master = await prisma.master.create({
    data: {
      name,
      phone,
      specialization,
      description,
      avatarUrl,
      rating: body.rating != null && body.rating !== '' ? Number(body.rating) : 5,
      reviewsCount: body.reviewsCount != null && body.reviewsCount !== '' ? Number(body.reviewsCount) : 0,
      distanceKm: body.distanceKm != null && body.distanceKm !== '' ? Number(body.distanceKm) : 0,
      priceFrom: body.priceFrom != null && body.priceFrom !== '' ? Number(body.priceFrom) : 150,
      guaranteeText: body.guaranteeText || 'Гарантия 30 дней на работу',
      isAvailable: body.isAvailable != null ? Boolean(body.isAvailable) : true
    }
  });
  return NextResponse.json(master, { status: 201 });
}
