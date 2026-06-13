import { NextResponse } from 'next/server';
import { z } from 'zod';
import { baseAccountFields, createAccount, normalizePhone } from '@/lib/accountRegistration';
import { enforceRateLimit } from '@/lib/rateLimit';
import { notifyAdmins } from '@/lib/notifications';
import { notifyTelegram, formatNewSeller } from '@/lib/notify';

export const dynamic = 'force-dynamic';

// Регистрация продавца «с нуля»: создаём новый аккаунт с ролью SELLER и магазин в одной транзакции.
const schema = z.object({
  ...baseAccountFields,
  shopName: z.string().trim().min(2, 'Название магазина слишком короткое').max(80),
  description: z.string().trim().max(500).optional().default(''),
  logoUrl: z.string().trim().url('Неверная ссылка на логотип').max(500).optional().or(z.literal(''))
});

export async function POST(request: Request) {
  // Не более 5 регистраций с одного IP за 10 минут.
  const limited = enforceRateLimit(request, 'seller-register', 5, 10 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Неверные данные' }, { status: 400 });
  }

  const { name, email, phone, password, shopName } = parsed.data;
  const description = parsed.data.description ?? '';
  const logoUrl = parsed.data.logoUrl || '';

  const result = await createAccount(
    { name, email, phone, password, role: 'SELLER' },
    async (tx, userId) => {
      await tx.seller.create({
        data: { shopName, description, logoUrl, phone: normalizePhone(phone), userId }
      });
    }
  );
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });

  // Оповещаем персонал о новом магазине (best-effort, не блокирует ответ).
  const cleanPhone = normalizePhone(phone);
  await notifyAdmins({
    type: 'system',
    title: 'Новый продавец',
    body: `${shopName} — ${name}`,
    link: '/admin'
  });
  await notifyTelegram(formatNewSeller({ shopName, ownerName: name, phone: cleanPhone }));

  return NextResponse.json({ success: true }, { status: 201 });
}
