import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { notifyAdmins } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// Возвращает тред поддержки текущего пользователя со всеми сообщениями.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Войдите в аккаунт' }, { status: 401 });
  }
  const thread = await prisma.supportThread.findUnique({
    where: { userId: session.user.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });
  return NextResponse.json({
    status: thread?.status ?? 'OPEN',
    messages: thread?.messages ?? []
  });
}

// Отправка сообщения от клиента. Тред создаётся лениво при первом обращении.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Войдите в аккаунт' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const text = typeof body?.body === 'string' ? body.body.trim() : '';
  if (!text) {
    return NextResponse.json({ message: 'Введите сообщение' }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ message: 'Сообщение слишком длинное' }, { status: 400 });
  }

  const thread = await prisma.supportThread.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {}
  });
  const message = await prisma.supportMessage.create({
    data: { threadId: thread.id, body: text, fromSupport: false }
  });
  // Переоткрываем тред и обновляем updatedAt для сортировки в админке.
  await prisma.supportThread.update({ where: { id: thread.id }, data: { status: 'OPEN' } });

  await notifyAdmins({
    type: 'support',
    title: 'Новое сообщение в поддержку',
    body: `${session.user.name ?? 'Клиент'}: ${text.slice(0, 80)}`,
    link: '/admin/support'
  });

  return NextResponse.json(message, { status: 201 });
}
