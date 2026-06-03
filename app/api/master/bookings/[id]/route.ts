import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = Object.values(OrderStatus);

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.role !== 'MASTER') {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const master = await prisma.master.findUnique({ where: { userId: session.user.id } });
  if (!master) {
    return NextResponse.json({ message: 'Профиль мастера не найден' }, { status: 404 });
  }
  const body = await request.json();
  const status = body.status as OrderStatus;
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ message: 'Неверный статус' }, { status: 400 });
  }
  const booking = await prisma.repairBooking.findUnique({ where: { id: params.id } });
  if (!booking || booking.masterId !== master.id) {
    return NextResponse.json({ message: 'Заявка не найдена' }, { status: 404 });
  }
  const updated = await prisma.repairBooking.update({
    where: { id: params.id },
    data: { status }
  });
  return NextResponse.json(updated);
}
