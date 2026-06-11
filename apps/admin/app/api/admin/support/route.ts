import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Список всех диалогов поддержки, свежие сверху, с последним сообщением.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const threads = await prisma.supportThread.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  return NextResponse.json(
    threads.map((t) => ({
      id: t.id,
      status: t.status,
      updatedAt: t.updatedAt,
      user: t.user,
      lastMessage: t.messages[0] ?? null
    }))
  );
}
