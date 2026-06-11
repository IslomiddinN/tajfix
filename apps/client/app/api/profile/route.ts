import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
  }

  const [orders, bookings, reviews, addresses] = await Promise.all([
    prisma.productOrder.count({ where: { userId: user.id } }),
    prisma.repairBooking.count({ where: { userId: user.id } }),
    prisma.review.count({ where: { userId: user.id } }),
    prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] })
  ]);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    stats: { orders, bookings, reviews },
    addresses
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const data: { name?: string; phone?: string; email?: string } = {};

  if (typeof body?.name === 'string' && body.name.trim()) data.name = body.name.trim();
  if (typeof body?.phone === 'string' && body.phone.trim()) data.phone = body.phone.trim();
  if (typeof body?.email === 'string' && body.email.trim()) {
    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Введите корректный email' }, { status: 400 });
    }
    data.email = email;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: 'Нет изменений' }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    // Нарушение уникальности email/phone.
    if (e?.code === 'P2002') {
      const field = Array.isArray(e.meta?.target) ? e.meta.target[0] : 'email';
      return NextResponse.json(
        { message: field === 'phone' ? 'Этот телефон уже занят' : 'Этот email уже занят' },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: 'Не удалось сохранить' }, { status: 500 });
  }
}
