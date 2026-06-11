import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const totalUsers = await prisma.user.count();
  const totalOrders = await prisma.productOrder.count();
  const totalBookings = await prisma.repairBooking.count();
  const revenueAgg = await prisma.productOrder.aggregate({ _sum: { totalAmount: true } });
  return NextResponse.json({
    totalUsers,
    totalOrders,
    totalBookings,
    totalRevenue: revenueAgg._sum.totalAmount ?? 0
  });
}
