import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const productOrders = await prisma.productOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, phone: true } }, items: { include: { product: true } } }
  });
  const bookings = await prisma.repairBooking.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } }, service: true, master: { select: { name: true } } }
  });
  return NextResponse.json({ productOrders, bookings });
}
