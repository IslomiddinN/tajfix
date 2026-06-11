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
    <main className="container py-6 sm:py-10">
      <div className="mx-auto max-w-2xl rounded-[24px] border border-border bg-card p-6 shadow-card sm:rounded-[32px] sm:p-8">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Вызов мастера</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">Оформите заявку на ремонт техники в Душанбе.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 sm:mt-8">
          <label className="block text-sm font-medium text-muted-foreground">
            Описание проблемы
            <textarea
              {...register('problemText')}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Адрес
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
          <label className="block text-sm font-medium text-muted-foreground">
            Предпочтительная дата
            <input
              type="date"
              {...register('preferredDate')}
              className="mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-muted-foreground">{success}</p> : null}
          <button disabled={loading} className="w-full rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60" type="submit">
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
