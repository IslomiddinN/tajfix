import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signMobileToken } from '@/lib/mobileToken';
import { enforceRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(2, 'Имя слишком короткое').max(80),
  email: z.string().trim().toLowerCase().email('Неверный email'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s\-()]{7,17}$/, 'Неверный номер телефона'),
  password: z.string().min(6, 'Пароль минимум 6 символов').max(100)
});

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, 'mobile-register', 5, 10 * 60_000);
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
  const user = await prisma.user.create({ data: { name, email, phone, passwordHash } });

  const token = signMobileToken({ sub: user.id, role: user.role, email: user.email });
  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
}
