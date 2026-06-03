import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.role !== 'MASTER') {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const master = await prisma.master.findUnique({ where: { userId: session.user.id } });
  if (!master) {
    return NextResponse.json({ message: 'Профиль мастера не найден' }, { status: 404 });
  }
  const bookings = await prisma.repairBooking.findMany({
    where: { masterId: master.id },
    include: { service: true, user: { select: { name: true, phone: true } } },
    orderBy: { preferredDate: 'asc' }
  });
  return NextResponse.json({ master: { id: master.id, name: master.name }, bookings });
}
