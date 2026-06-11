import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Проверяет, что адрес принадлежит текущему пользователю.
async function ownAddress(id: string, userId: string) {
  const address = await prisma.address.findUnique({ where: { id } });
  return address && address.userId === userId ? address : null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const existing = await ownAddress(params.id, session.user.id);
  if (!existing) {
    return NextResponse.json({ message: 'Адрес не найден' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const data: { label?: string; address?: string; isDefault?: boolean } = {};
  if (typeof body?.label === 'string') data.label = body.label.trim();
  if (typeof body?.address === 'string' && body.address.trim()) data.address = body.address.trim();
  const makeDefault = body?.isDefault === true;

  const updated = await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
      data.isDefault = true;
    }
    return tx.address.update({ where: { id: params.id }, data });
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const existing = await ownAddress(params.id, session.user.id);
  if (!existing) {
    return NextResponse.json({ message: 'Адрес не найден' }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: params.id } });

  // Если удалили адрес по умолчанию — назначаем по умолчанию самый старый из оставшихся.
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' }
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  return NextResponse.json({ success: true });
}
