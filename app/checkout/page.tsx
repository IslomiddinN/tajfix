'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wallet } from 'lucide-react';

const checkoutSchema = z.object({
  address: z.string().min(5, 'Введите адрес'),
  phone: z.string().min(10, 'Введите номер телефона')
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema)
  });

  const onSubmit = async (values: CheckoutValues) => {
    setError('');
    setSuccess('');
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message || 'Ошибка оформления заказа');
      return;
    }
    setSuccess('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
  };

  return (
    <main className="container py-6 sm:py-10">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-border bg-card p-6 shadow-card sm:rounded-[32px] sm:p-8">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Оформление заказа</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">Заполните данные для доставки и подтверждения.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 sm:mt-8">
          <label className="block text-sm font-medium text-muted-foreground">
            Адрес доставки
            <input
              type="text"
              {...register('address')}
              className="mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Телефон
            <input
              type="tel"
              {...register('phone')}
              className="mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </label>
          <div className="flex items-center gap-3 rounded-3xl border border-green-500/30 bg-green-500/10 p-4">
            <Wallet className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Оплата наличными при получении</p>
              <p className="text-xs text-green-700/80 dark:text-green-300/80">Курьер примет оплату при доставке. Онлайн-оплата будет доступна позже.</p>
            </div>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
          <button className="w-full rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90" type="submit">
            Подтвердить заказ
          </button>
        </form>
      </div>
    </main>
  );
}
