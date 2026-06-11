import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(2, 'Имя слишком короткое').max(80),
  email: z.string().trim().toLowerCase().email('Неверный email'),
  // Телефоны Таджикистана: +992 и 9 цифр, допускаем пробелы/дефисы во вводе.
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s\-()]{7,17}$/, 'Неверный номер телефона'),
  password: z.string().min(6, 'Пароль минимум 6 символов').max(100)
});

export async function POST(request: Request) {
  // Не более 5 регистраций с одного IP за 10 минут.
  const limited = enforceRateLimit(request, 'register', 5, 10 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Неверные данные' },
      { status: 400 }
    );
  }
  const { name, email, password } = parsed.data;
  const phone = parsed.data.phone.replace(/[\s\-()]/g, '');

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existing) {
    return NextResponse.json(
      { message: 'Пользователь с таким email или телефоном уже существует' },
      { status: 409 }
    );
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, phone, passwordHash } });
  return NextResponse.json({ success: true });
}
