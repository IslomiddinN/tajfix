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
    <main className="container py-10">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
        <h1 className="text-3xl font-semibold text-slate-950">Оформление заказа</h1>
        <p className="mt-3 text-slate-600">Заполните данные для доставки и подтверждения.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Адрес доставки
            <input
              type="text"
              {...register('address')}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Телефон
            <input
              type="tel"
              {...register('phone')}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Оплата наличными при получении</p>
              <p className="text-xs text-emerald-700">Курьер примет оплату при доставке. Онлайн-оплата будет доступна позже.</p>
            </div>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
          <button className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
            Подтвердить заказ
          </button>
        </form>
      </div>
    </main>
  );
}
