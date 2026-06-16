import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signMobileToken } from '@/lib/mobileToken';
import { enforceRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s\-()]{7,17}$/, 'Неверный номер телефона'),
  password: z.string().min(1, 'Введите пароль')
});

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, 'mobile-login', 10, 10 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Неверные данные' }, { status: 400 });
  }

  const { password } = parsed.data;
  // Normalise: drop spaces/dashes/parens, then match both with and without a
  // leading "+" so "+992…" and "992…" both work.
  const digits = parsed.data.phone.replace(/[\s\-()]/g, '').replace(/^\+/, '');
  const user = await prisma.user.findFirst({
    where: { phone: { in: [`+${digits}`, digits] } }
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ message: 'Неверный номер телефона или пароль' }, { status: 401 });
  }

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
