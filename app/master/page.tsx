'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, MapPin, Phone, Wrench } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

const STATUSES = ['NEW', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Новая',
  CONFIRMED: 'Подтверждена',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена'
};

interface Booking {
  id: string;
  service: { title: string };
  user: { name: string; phone: string };
  status: string;
  problemText: string;
  address: string;
  phone: string;
  estimatedPrice: number;
  preferredDate: string;
}

export default function MasterDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [masterName, setMasterName] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/master/bookings')
      .then(async (res) => {
        if (res.status === 403 || res.status === 404) {
          setForbidden(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setMasterName(data.master?.name ?? '');
        setBookings(data.bookings ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function changeStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/master/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (forbidden) {
    return <EmptyState title="Нет доступа" description="Этот раздел доступен только мастерам сервиса." />;
  }

  return (
    <main className="container py-10">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Wrench className="h-4 w-4 text-sky-600" /> Кабинет мастера
        </div>
        <h1 className="text-3xl font-semibold text-slate-950">{masterName || 'Мои заявки'}</h1>
        <p className="text-slate-600">Назначенные вам заявки на ремонт и управление их статусом.</p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState title="Заявок пока нет" description="Новые заявки на ремонт появятся здесь, как только клиенты выберут вас." />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-card">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{booking.service.title}</p>
                  <p className="mt-1 text-sm text-slate-500">Клиент: {booking.user?.name ?? '—'}</p>
                </div>
                <span className="self-start rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                  {STATUS_LABELS[booking.status] ?? booking.status}
                </span>
              </div>

              <p className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">{booking.problemText}</p>

              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" /> {booking.address}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" /> {booking.phone}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  {new Date(booking.preferredDate).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p className="font-medium text-slate-800">Оценка: {booking.estimatedPrice} сом</p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500">Сменить статус:</span>
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={updatingId === booking.id || booking.status === status}
                    onClick={() => changeStatus(booking.id, status)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed ${
                      booking.status === status
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50'
                    }`}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
