import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { notifyTelegram, formatNewBooking } from '@/lib/notify';
import { notify, notifyAdmins } from '@/lib/notifications';
import { enforceRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Не более 10 заявок с одного IP за минуту.
  const limited = enforceRateLimit(request, 'bookings', 10, 60_000);
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });

  const body = await request.json();
  const { serviceId, masterId, preferredDate } = body;
  const problemText = typeof body.problemText === 'string' ? body.problemText.trim() : '';
  const address = typeof body.address === 'string' ? body.address.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (!serviceId || !problemText || !address || !phone || !preferredDate) {
    return NextResponse.json({ message: 'Заполните все поля' }, { status: 400 });
  }

  const parsedDate = new Date(preferredDate);
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ message: 'Неверная дата' }, { status: 400 });
  }

  // Проверяем, что услуга существует, и берём её стартовую цену.
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return NextResponse.json({ message: 'Услуга не найдена' }, { status: 404 });
  }

  let resolvedMaster = null;
  if (masterId) {
    resolvedMaster = await prisma.master.findUnique({ where: { id: masterId } });
    if (!resolvedMaster) {
      return NextResponse.json({ message: 'Мастер не найден' }, { status: 404 });
    }
  }

  // Оценка: цена мастера (если выбран), иначе стартовая цена услуги.
  const estimatedPrice = resolvedMaster?.priceFrom ?? service.priceFrom;

  const booking = await prisma.repairBooking.create({
    data: {
      userId: user.id,
      serviceId,
      masterId: masterId || undefined,
      problemText,
      address,
      phone,
      preferredDate: parsedDate,
      estimatedPrice,
      status: 'NEW'
    }
  });

  await notifyTelegram(
    formatNewBooking({
      bookingId: booking.id,
      customerName: user.name,
      phone,
      address,
      serviceTitle: service.title,
      masterName: resolvedMaster?.name,
      problemText,
      preferredDate: parsedDate,
      estimatedPrice
    })
  );

  // Уведомления в приложении: админам о новой заявке + назначенному мастеру.
  await notifyAdmins({
    type: 'booking',
    title: 'Новая заявка на ремонт',
    body: `${service.title} · ${user.name}`,
    link: '/admin/orders'
  });
  if (resolvedMaster?.userId) {
    await notify(resolvedMaster.userId, {
      type: 'booking',
      title: 'Новая заявка',
      body: `${service.title} · ${address}`,
      link: '/master/orders'
    });
  }

  return NextResponse.json(booking);
}
