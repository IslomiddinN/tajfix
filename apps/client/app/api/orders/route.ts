import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
  }
  const bookings = await prisma.repairBooking.findMany({
    where: { userId: user.id },
    include: { service: true }
  });
  const productOrders = await prisma.productOrder.findMany({ where: { userId: user.id } });
  return NextResponse.json({ bookings, productOrders });
}
