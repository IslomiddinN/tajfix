import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Список последних уведомлений + число непрочитанных.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.notification.count({ where: { userId: session.user.id, read: false } })
  ]);
  return NextResponse.json({ items, unread });
}

// Пометить прочитанным: { id } — одно, { all: true } — все.
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);

  if (body?.all === true) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true }
    });
    return NextResponse.json({ success: true });
  }

  if (typeof body?.id === 'string') {
    // updateMany с фильтром по userId — чтобы нельзя было пометить чужое уведомление.
    await prisma.notification.updateMany({
      where: { id: body.id, userId: session.user.id },
      data: { read: true }
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: 'Нет данных' }, { status: 400 });
}
