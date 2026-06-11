'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Store } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const schema = z.object({
  shopName: z.string().min(2, 'Введите название магазина'),
  phone: z.string().min(9, 'Введите номер телефона'),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url('Неверная ссылка').or(z.literal('')).optional()
});

type Values = z.infer<typeof schema>;

export default function SellerRegisterPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Values>({ resolver: zodResolver(schema) });

  if (status === 'loading') {
    return (
      <main className="container py-10">
        <LoadingSpinner />
      </main>
    );
  }

  // Уже продавец — отправляем в кабинет.
  if (session?.user?.role === 'SELLER') {
    router.replace('/seller');
    return null;
  }

  if (!session) {
    return (
      <main className="container py-10">
        <div className="mx-auto max-w-md rounded-[28px] border border-border bg-card p-8 text-center shadow-card">
          <Store className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-2xl font-semibold text-foreground">Стать продавцом</h1>
          <p className="mt-2 text-muted-foreground">Войдите в аккаунт, чтобы открыть свой магазин на TajFix.</p>
          <Link
            href="/login?callbackUrl=/seller/register"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Войти
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Нет аккаунта? <Link href="/register" className="font-semibold text-primary">Зарегистрироваться</Link>
          </p>
        </div>
      </main>
    );
  }

  if (session.user.role === 'ADMIN' || session.user.role === 'MASTER') {
    return (
      <main className="container py-10">
        <div className="mx-auto max-w-md rounded-[28px] border border-border bg-card p-8 text-center shadow-card">
          <h1 className="text-2xl font-semibold text-foreground">Недоступно</h1>
          <p className="mt-2 text-muted-foreground">
            Этот аккаунт уже используется как администратор или мастер. Откройте магазин с обычного аккаунта.
          </p>
        </div>
      </main>
    );
  }

  const onSubmit = async (values: Values) => {
    setError('');
    setSubmitting(true);
    const res = await fetch('/api/seller/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Не удалось создать магазин');
      setSubmitting(false);
      return;
    }
    // Обновляем сессию, чтобы JWT подхватил новую роль SELLER без повторного входа.
    await update();
    router.push('/seller');
  };

  const inputClass =
    'mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary';

  return (
    <main className="container py-6 sm:py-10">
      <div className="mx-auto max-w-md rounded-[24px] border border-border bg-card p-6 shadow-card sm:rounded-[32px] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Стать продавцом</h1>
            <p className="text-sm text-muted-foreground">Откройте магазин и продавайте свои товары.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <label className="block text-sm font-medium text-muted-foreground">
            Название магазина
            <input type="text" {...register('shopName')} className={inputClass} />
            {errors.shopName ? <span className="mt-1 block text-xs text-red-600">{errors.shopName.message}</span> : null}
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Телефон
            <input type="tel" {...register('phone')} className={inputClass} />
            {errors.phone ? <span className="mt-1 block text-xs text-red-600">{errors.phone.message}</span> : null}
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Описание (необязательно)
            <textarea rows={3} {...register('description')} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Ссылка на логотип (необязательно)
            <input type="url" {...register('logoUrl')} className={inputClass} />
            {errors.logoUrl ? <span className="mt-1 block text-xs text-red-600">{errors.logoUrl.message}</span> : null}
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            disabled={submitting}
            type="submit"
            className="w-full rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? 'Создание…' : 'Открыть магазин'}
          </button>
        </form>
      </div>
    </main>
  );
}
