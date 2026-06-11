import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// Полная переписка одного диалога + данные клиента.
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const thread = await prisma.supportThread.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      messages: { orderBy: { createdAt: 'asc' } }
    }
  });
  if (!thread) {
    return NextResponse.json({ message: 'Диалог не найден' }, { status: 404 });
  }
  return NextResponse.json(thread);
}

// Ответ поддержки. Можно одновременно сменить статус (OPEN/CLOSED).
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const thread = await prisma.supportThread.findUnique({ where: { id: params.id } });
  if (!thread) {
    return NextResponse.json({ message: 'Диалог не найден' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.body === 'string' ? body.body.trim() : '';
  const status = body?.status === 'CLOSED' ? 'CLOSED' : 'OPEN';

  if (!text) {
    return NextResponse.json({ message: 'Введите ответ' }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ message: 'Сообщение слишком длинное' }, { status: 400 });
  }

  const message = await prisma.supportMessage.create({
    data: { threadId: thread.id, body: text, fromSupport: true }
  });
  await prisma.supportThread.update({ where: { id: thread.id }, data: { status } });

  await notify(thread.userId, {
    type: 'support',
    title: 'Ответ поддержки',
    body: text.slice(0, 80),
    link: '/support'
  });

  return NextResponse.json(message, { status: 201 });
}
