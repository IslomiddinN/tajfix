import { NextResponse } from 'next/server';
import { z } from 'zod';
import { baseAccountFields, createAccount } from '@/lib/accountRegistration';
import { enforceRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// Регистрация администратора защищена секретным кодом из .env (ADMIN_REGISTRATION_CODE),
// чтобы кто угодно не мог выдать себе админ-доступ.
const schema = z.object({
  ...baseAccountFields,
  code: z.string().min(1, 'Введите код регистрации')
});

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, 'admin-register', 5, 10 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Неверные данные' }, { status: 400 });
  }

  const expected = process.env.ADMIN_REGISTRATION_CODE;
  if (!expected) {
    return NextResponse.json(
      { message: 'Регистрация администраторов отключена. Задайте ADMIN_REGISTRATION_CODE в .env' },
      { status: 503 }
    );
  }
  if (parsed.data.code !== expected) {
    return NextResponse.json({ message: 'Неверный код регистрации' }, { status: 403 });
  }

  const { name, email, phone, password } = parsed.data;
  const result = await createAccount({ name, email, phone, password, role: 'ADMIN' });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });

  return NextResponse.json({ success: true }, { status: 201 });
}
