'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  applianceIcon,
  fmtDateTime,
  fmtMoney,
  NEXT_STATUS,
  STATUS_COLOR,
  STATUS_LABEL,
  useMasterStore,
  type OrderStatus
} from '@/lib/master/store';

const LIFECYCLE: OrderStatus[] = ['NEW', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

export default function OrderDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, bookings = [], setBookingStatus } = useMasterStore();
  const order = bookings.find((o) => o.id === params.id);

  const [completeOpen, setCompleteOpen] = useState(false);
  const [finalPrice, setFinalPrice] = useState('');

  if (loading) return <LoadingSpinner />;

  if (!order) {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-muted-foreground">Заказ не найден</p>
        <Link href="/master/orders" className="mt-4 inline-block text-primary">
          Назад к заказам
        </Link>
      </div>
    );
  }

  const next = NEXT_STATUS[order.status];
  const phone = order.user.phone ?? order.phone;
  const currentStep = LIFECYCLE.indexOf(order.status);

  const handleNext = () => {
    if (next?.next === 'COMPLETED') {
      setFinalPrice(String(order.estimatedPrice));
      setCompleteOpen(true);
    } else if (next) {
      setBookingStatus(order.id, next.next);
    }
  };

  const handleComplete = () => {
    setBookingStatus(order.id, 'COMPLETED', Number(finalPrice) || order.estimatedPrice);
    setCompleteOpen(false);
  };

  return (
    <div className="px-5 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => router.push('/master/orders')} className="grid h-10 w-10 place-items-center rounded-full bg-card">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-2xl">{applianceIcon(order.service.title)}</span>
        <div>
          <p className="text-lg font-bold leading-tight">{order.service.title}</p>
          <p className="text-xs text-muted-foreground">{fmtDateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground">Описание проблемы</p>
        <p className="mt-1 text-sm">{order.problemText}</p>
      </div>

      <div className="mt-3 rounded-3xl bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground">Клиент</p>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{order.user.name ?? 'Клиент'}</p>
            {phone && <p className="text-xs text-muted-foreground">{phone}</p>}
          </div>
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="grid h-10 w-10 place-items-center rounded-full bg-green-500/15 text-green-400">
              <Phone className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-4"
      >
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary">
          <MapPin className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Адрес</p>
          <p className="text-sm font-medium">{order.address}</p>
        </div>
        <span className="text-xs font-semibold text-primary">Открыть</span>
      </a>

      <div className="mt-3 rounded-3xl bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground">Стоимость</p>
        <p className="mt-1 text-xl font-bold text-primary">{fmtMoney(order.estimatedPrice)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Желаемая дата: {fmtDateTime(order.preferredDate)}
        </p>
      </div>

      {/* Lifecycle tracker */}
      {order.status !== 'CANCELLED' && (
        <div className="mt-3 rounded-3xl bg-card p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Статус заказа</p>
          <ol className="space-y-2">
            {LIFECYCLE.map((s, i) => {
              const reached = currentStep >= i;
              return (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${reached ? 'bg-primary' : 'bg-muted'}`} />
                  <span className={reached ? '' : 'text-muted-foreground'}>{STATUS_LABEL[s]}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Actions */}
      {order.status === 'NEW' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => setBookingStatus(order.id, 'CONFIRMED')} className="h-12 rounded-2xl bg-green-500 font-semibold text-white">
            Принять
          </button>
          <button onClick={() => setBookingStatus(order.id, 'CANCELLED')} className="h-12 rounded-2xl bg-destructive/15 font-semibold text-destructive">
            Отклонить
          </button>
        </div>
      )}
      {next && (
        <button onClick={handleNext} className="mt-4 h-12 w-full rounded-2xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/30">
          {next.label}
        </button>
      )}

      {order.status === 'COMPLETED' && (
        <div className="mt-4 rounded-3xl border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-xs font-medium text-green-400">Заказ завершён</p>
          <p className="mt-1 text-sm">Итоговая сумма: {fmtMoney(order.estimatedPrice)}</p>
        </div>
      )}

      {completeOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setCompleteOpen(false)}>
          <div className="w-full max-w-[430px] rounded-t-3xl bg-card p-5 fade-up" onClick={(e) => e.stopPropagation()}>
            <p className="mb-1 text-lg font-bold">Завершить заказ</p>
            <p className="mb-4 text-xs text-muted-foreground">Укажите итоговую стоимость работ.</p>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Итоговая стоимость (сомони)</span>
              <input
                inputMode="numeric"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                className="h-11 w-full rounded-xl bg-background px-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <button onClick={handleComplete} className="mt-5 h-12 w-full rounded-2xl bg-primary font-semibold text-primary-foreground">
              Завершить и выставить счёт
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
