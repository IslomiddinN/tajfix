'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const bookingSchema = z.object({
  problemText: z.string().min(10, 'Опишите проблему как можно точнее'),
  address: z.string().min(5, 'Введите адрес'),
  phone: z.string().min(10, 'Введите телефон'),
  preferredDate: z.string().min(10, 'Выберите дату')
});

type BookingValues = z.infer<typeof bookingSchema>;

function BookRepairForm() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId') || '';
  const masterId = searchParams.get('masterId') || '';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema)
  });

  const onSubmit = async (values: BookingValues) => {
    setError('');
    setSuccess('');
    setLoading(true);
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, serviceId, masterId })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.message || 'Ошибка бронирования');
      return;
    }
    setSuccess('Заявка принята. Мастер свяжется с вами для подтверждения.');
  };

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
        <h1 className="text-3xl font-semibold text-slate-950">Вызов мастера</h1>
        <p className="mt-2 text-slate-600">Оформите заявку на ремонт техники в Душанбе.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Описание проблемы
            <textarea
              {...register('problemText')}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Адрес
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
          <label className="block text-sm font-medium text-slate-700">
            Предпочтительная дата
            <input
              type="date"
              {...register('preferredDate')}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-slate-600">{success}</p> : null}
          <button disabled={loading} className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" type="submit">
            {loading ? 'Отправка...' : 'Вызвать мастера'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function BookRepairPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BookRepairForm />
    </Suspense>
  );
}
