import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { notify } from '@/lib/notifications';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = Object.values(OrderStatus);

const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтверждён',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён'
};

interface Params {
  params: { id: string };
}

// PATCH /api/admin/orders/:id  body: { status, type: 'order' | 'booking' }
export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Нет доступа' }, { status: 403 });
  }
  const body = await request.json();
  const status = body.status as OrderStatus;
  const type = body.type === 'booking' ? 'booking' : 'order';
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ message: 'Неверный статус' }, { status: 400 });
  }
  if (type === 'booking') {
    const booking = await prisma.repairBooking.findUnique({ where: { id: params.id } });
    if (!booking) return NextResponse.json({ message: 'Заявка не найдена' }, { status: 404 });
    const updated = await prisma.repairBooking.update({ where: { id: params.id }, data: { status } });
    await notify(booking.userId, {
      type: 'booking',
      title: 'Статус заявки обновлён',
      body: `Заявка #${params.id.slice(0, 8)}: ${STATUS_LABEL[status]}`,
      link: '/orders'
    });
    // Назначенного мастера тоже оповещаем о смене статуса его заявки.
    if (booking.masterId) {
      const master = await prisma.master.findUnique({
        where: { id: booking.masterId },
        select: { userId: true }
      });
      if (master?.userId) {
        await notify(master.userId, {
          type: 'booking',
          title: 'Статус заявки обновлён',
          body: `Заявка #${params.id.slice(0, 8)}: ${STATUS_LABEL[status]}`,
          link: '/master'
        });
      }
    }
    return NextResponse.json(updated);
  }
  const order = await prisma.productOrder.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ message: 'Заказ не найден' }, { status: 404 });
  const updated = await prisma.productOrder.update({ where: { id: params.id }, data: { status } });
  await notify(order.userId, {
    type: 'order',
    title: 'Статус заказа обновлён',
    body: `Заказ #${params.id.slice(0, 8)}: ${STATUS_LABEL[status]}`,
    link: '/orders'
  });
  return NextResponse.json(updated);
}
