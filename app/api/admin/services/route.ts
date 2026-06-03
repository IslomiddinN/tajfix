import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

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
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const body = await request.json();
  const { title, description, categoryId, priceFrom, imageUrl } = body;
  if (!title || !description || !categoryId || priceFrom == null || !imageUrl) {
    return NextResponse.json({ message: 'Заполните обязательные поля' }, { status: 400 });
  }
  const slug = (body.slug && slugify(body.slug)) || `${slugify(title)}-${Date.now().toString(36)}`;
  try {
    const service = await prisma.service.create({
      data: {
        title,
        slug,
        description,
        categoryId,
        priceFrom: Number(priceFrom),
        imageUrl,
        isUrgentAvailable: body.isUrgentAvailable != null ? Boolean(body.isUrgentAvailable) : true
      }
    });
    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ message: 'Услуга с таким slug уже существует' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Ошибка создания услуги' }, { status: 500 });
  }
}
