'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ServiceItem {
  id: string;
  title: string;
  priceFrom: number;
}

const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Выберите услугу'),
  problemText: z.string().min(10, 'Опишите проблему как можно точнее'),
  address: z.string().min(5, 'Введите адрес'),
  phone: z.string().min(10, 'Введите телефон'),
  preferredDate: z.string().min(10, 'Выберите дату')
});

type BookingValues = z.infer<typeof bookingSchema>;

const inputClass =
  'mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary';

function BookRepairForm() {
  const searchParams = useSearchParams();
  const urlServiceId = searchParams.get('serviceId') || '';
  const masterId = searchParams.get('masterId') || '';
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { serviceId: urlServiceId }
  });

  // Список услуг для выбора, если пользователь зашёл на /book без ?serviceId=.
  useEffect(() => {
    fetch('/api/services')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setServices(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Сегодняшняя дата — чтобы нельзя было выбрать день в прошлом.
  const today = new Date().toISOString().slice(0, 10);
  const hintClass = 'mt-1 block text-xs font-normal text-muted-foreground';

  const onSubmit = async (values: BookingValues) => {
    setError('');
    setSuccess('');
    setLoading(true);
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, masterId })
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
            Услуга
            <select {...register('serviceId')} className={inputClass}>
              <option value="">Выберите услугу</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — от {s.priceFrom} сом
                </option>
              ))}
            </select>
            <span className={hintClass}>Выберите технику, которую нужно отремонтировать.</span>
            {errors.serviceId ? <span className="mt-1 block text-xs text-red-600">{errors.serviceId.message}</span> : null}
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Описание проблемы
            <textarea
              {...register('problemText')}
              rows={4}
              placeholder="Например: стиральная машина не сливает воду и шумит при отжиме"
              className={inputClass}
            />
            <span className={hintClass}>Чем подробнее опишете, тем точнее будет оценка.</span>
            {errors.problemText ? (
              <span className="mt-1 block text-xs text-red-600">{errors.problemText.message}</span>
            ) : null}
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Адрес
            <input
              type="text"
              {...register('address')}
              placeholder="Город, район, улица, дом, квартира"
              className={inputClass}
            />
            <span className={hintClass}>Куда приехать мастеру.</span>
            {errors.address ? <span className="mt-1 block text-xs text-red-600">{errors.address.message}</span> : null}
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Телефон
            <input type="tel" {...register('phone')} placeholder="+992 90 123 45 67" className={inputClass} />
            <span className={hintClass}>На этот номер мастер позвонит для подтверждения.</span>
            {errors.phone ? <span className="mt-1 block text-xs text-red-600">{errors.phone.message}</span> : null}
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Предпочтительная дата
            <input type="date" {...register('preferredDate')} min={today} className={inputClass} />
            <span className={hintClass}>Выберите удобный день — мастер согласует время.</span>
            {errors.preferredDate ? (
              <span className="mt-1 block text-xs text-red-600">{errors.preferredDate.message}</span>
            ) : null}
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-muted-foreground">{success}</p> : null}
          <button
            disabled={loading}
            className="w-full rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
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
