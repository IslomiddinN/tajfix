import { NextResponse } from 'next/server';
import { z } from 'zod';
import { baseAccountFields, createAccount, normalizePhone } from '@/lib/accountRegistration';
import { enforceRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// Регистрация мастера «с нуля»: создаём новый аккаунт с ролью MASTER и профиль мастера.
const schema = z.object({
  ...baseAccountFields,
  specialization: z.string().trim().min(2, 'Укажите специализацию').max(120),
  description: z.string().trim().max(500).optional().default(''),
  // Минимальная цена, строка из формы приводится к числу.
  priceFrom: z.coerce.number().int().min(0).max(1_000_000).optional().default(0)
});

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, 'master-register', 5, 10 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Неверные данные' }, { status: 400 });
  }

  const { name, email, phone, password, specialization, priceFrom } = parsed.data;
  const description = parsed.data.description ?? '';

  const result = await createAccount(
    { name, email, phone, password, role: 'MASTER' },
    async (tx, userId) => {
      await tx.master.create({
        data: {
          name,
          phone: normalizePhone(phone),
          avatarUrl: '',
          specialization,
          description,
          rating: 0,
          reviewsCount: 0,
          distanceKm: 0,
          priceFrom,
          guaranteeText: 'Гарантия на выполненные работы',
          userId
        }
      });
    }
  );
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });

  return NextResponse.json({ success: true }, { status: 201 });
}
