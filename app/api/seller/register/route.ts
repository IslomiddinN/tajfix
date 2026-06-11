import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const schema = z.object({
  shopName: z.string().trim().min(2, 'Название магазина слишком короткое').max(80),
  description: z.string().trim().max(500).optional().default(''),
  logoUrl: z.string().trim().url('Неверная ссылка на логотип').max(500).optional().or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s\-()]{7,17}$/, 'Неверный номер телефона')
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Войдите в аккаунт' }, { status: 401 });
  }
  if (session.user.role === 'ADMIN' || session.user.role === 'MASTER') {
    return NextResponse.json(
      { message: 'Этот аккаунт уже используется как администратор или мастер' },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Неверные данные' }, { status: 400 });
  }

  const existing = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (existing) {
    return NextResponse.json({ message: 'Вы уже зарегистрированы как продавец' }, { status: 409 });
  }

  const { shopName, description } = parsed.data;
  const phone = parsed.data.phone.replace(/[\s\-()]/g, '');
  const logoUrl = parsed.data.logoUrl || '';

  const seller = await prisma.$transaction(async (tx) => {
    const created = await tx.seller.create({
      data: { shopName, description, logoUrl, phone, userId: session.user.id }
    });
    await tx.user.update({ where: { id: session.user.id }, data: { role: 'SELLER' } });
    return created;
  });

  return NextResponse.json({ success: true, seller }, { status: 201 });
}
