import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Prisma, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Общие поля для регистрации любого аккаунта (клиент, продавец, мастер, админ).
 * Подмешиваются в роль-специфичную схему через spread: z.object({ ...baseAccountFields, ... }).
 */
export const baseAccountFields = {
  name: z.string().trim().min(2, 'Имя слишком короткое').max(80),
  email: z.string().trim().toLowerCase().email('Неверный email'),
  // Телефоны Таджикистана: +992 и 9 цифр, допускаем пробелы/дефисы во вводе.
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s\-()]{7,17}$/, 'Неверный номер телефона'),
  password: z.string().min(6, 'Пароль минимум 6 символов').max(100)
};

/** Убирает пробелы/дефисы/скобки из телефона, оставляя только цифры и ведущий +. */
export function normalizePhone(phone: string) {
  return phone.replace(/[\s\-()]/g, '');
}

export type CreateAccountResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; message: string };

/**
 * Создаёт нового пользователя с заданной ролью (и, опционально, связанный профиль
 * Master/Seller в той же транзакции). Проверяет уникальность email/телефона и
 * хеширует пароль. Логика единая для всех приложений монорепо — каждое register-API
 * лишь валидирует свои поля и вызывает createAccount.
 */
export async function createAccount(
  data: { name: string; email: string; phone: string; password: string; role: Role },
  profile?: (tx: Prisma.TransactionClient, userId: string) => Promise<void>
): Promise<CreateAccountResult> {
  const email = data.email.trim().toLowerCase();
  const phone = normalizePhone(data.phone);

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existing) {
    return { ok: false, status: 409, message: 'Пользователь с таким email или телефоном уже существует' };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const userId = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: data.name, email, phone, passwordHash, role: data.role }
    });
    if (profile) await profile(tx, user.id);
    return user.id;
  });

  return { ok: true, userId };
}
