'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Phone } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  applianceIcon,
  fmtDateTime,
  fmtMoney,
  isActive,
  STATUS_COLOR,
  STATUS_LABEL,
  useMasterStore,
  type Booking,
  type OrderStatus
} from '@/lib/master/store';

const TABS: { key: 'all' | OrderStatus | 'active'; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'NEW', label: 'Новые' },
  { key: 'active', label: 'В работе' },
  { key: 'COMPLETED', label: 'Завершённые' },
  { key: 'CANCELLED', label: 'Отменённые' }
];

export default function MasterOrders() {
  const { loading, bookings = [] } = useMasterStore();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('all');

  const filtered = bookings.filter((o) => {
    if (tab === 'all') return true;
    if (tab === 'active') return isActive(o.status);
    return o.status === tab;
  });

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-bold">Заказы</h1>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              tab === t.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              Ничего не найдено
            </div>
          )}
          {filtered.map((o) => (
            <Card key={o.id} o={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function Card({ o }: { o: Booking }) {
  const phone = o.user.phone ?? o.phone;
  return (
    <div className="fade-up rounded-3xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-xl">{applianceIcon(o.service.title)}</span>
          <div>
            <p className="text-sm font-semibold leading-tight">{o.service.title}</p>
            <p className="text-xs text-muted-foreground">{fmtDateTime(o.createdAt)}</p>
          </div>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[o.status]}`}>
          {STATUS_LABEL[o.status]}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{o.problemText}</p>
      <p className="mt-2 text-xs text-muted-foreground">📍 {o.address}</p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold">{o.user.name ?? 'Клиент'}</p>
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="grid h-8 w-8 place-items-center rounded-full bg-green-500/15 text-green-400"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
        <span className="text-base font-bold text-primary">{fmtMoney(o.estimatedPrice)}</span>
      </div>

      <Link href={`/master/orders/${o.id}`} className="mt-3 grid h-10 place-items-center rounded-xl bg-secondary text-sm font-semibold">
        Подробнее
      </Link>
    </div>
  );
}
