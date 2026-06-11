import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const existing = await prisma.service.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ message: 'Услуга не найдена' }, { status: 404 });
  const body = await request.json();
  try {
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        categoryId: body.categoryId ?? existing.categoryId,
        priceFrom: body.priceFrom != null && body.priceFrom !== '' ? Number(body.priceFrom) : existing.priceFrom,
        imageUrl: body.imageUrl ?? existing.imageUrl,
        isUrgentAvailable: 'isUrgentAvailable' in body ? Boolean(body.isUrgentAvailable) : existing.isUrgentAvailable
      }
    });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ message: 'Ошибка обновления услуги' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  try {
    await prisma.service.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      return NextResponse.json({ message: 'Нельзя удалить: по услуге есть заявки' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Ошибка удаления услуги' }, { status: 500 });
  }
}
