import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
  const body = await request.json();
  const { serviceId, masterId, problemText, address, phone, preferredDate } = body;
  if (!serviceId || !problemText || !address || !phone || !preferredDate) {
    return NextResponse.json({ message: 'Неверные данные' }, { status: 400 });
  }
  const estimatedPrice = 250;
  const booking = await prisma.repairBooking.create({
    data: {
      userId: user.id,
      serviceId,
      masterId: masterId || undefined,
      problemText,
      address,
      phone,
      preferredDate: new Date(preferredDate),
      estimatedPrice,
      status: 'NEW'
    }
  });
  return NextResponse.json(booking);
}
