'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const STATUSES = ['NEW', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтверждён',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён'
};

interface ProductOrder {
  id: string;
  totalAmount: number;
  status: string;
  address: string;
  createdAt: string;
  user: { name: string; phone: string };
  items: { id: string; quantity: number; product: { title: string } }[];
}

interface Booking {
  id: string;
  status: string;
  address: string;
  problemText: string;
  preferredDate: string;
  estimatedPrice: number;
  user: { name: string };
  service: { title: string };
  master: { name: string } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.productOrders ?? []);
        setBookings(data.bookings ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function setStatus(id: string, status: string, type: 'order' | 'booking') {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, type })
      });
      if (res.ok) {
        if (type === 'order') {
          setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
        } else {
          setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
        }
      }
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  const statusSelect = (id: string, status: string, type: 'order' | 'booking') => (
    <select
      value={status}
      disabled={busy === id}
      onChange={(e) => setStatus(id, e.target.value, type)}
      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground outline-none focus:border-primary"
    >
      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
    </select>
  );

  return (
    <div className="fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Заказы и заявки</h1>
        <p className="mt-1 text-sm text-muted-foreground">Меняйте статусы заказов магазина и ремонтных заявок.</p>
      </div>

      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">Заказы магазина ({orders.length})</h2>
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="fade-up rounded-3xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-foreground">Заказ #{o.id.slice(0, 8)} · {o.totalAmount} сом</p>
                  <p className="mt-1 text-sm text-muted-foreground">{o.user?.name} · {o.user?.phone} · {o.address}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{o.items.map((i) => `${i.product.title} ×${i.quantity}`).join(', ')}</p>
                </div>
                {statusSelect(o.id, o.status, 'order')}
              </div>
            </div>
          ))}
          {orders.length === 0 ? <p className="text-sm text-muted-foreground">Заказов пока нет</p> : null}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">Ремонтные заявки ({bookings.length})</h2>
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="fade-up rounded-3xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-foreground">{b.service.title} · {b.estimatedPrice} сом</p>
                  <p className="mt-1 text-sm text-muted-foreground">{b.user?.name} · {b.address}{b.master ? ` · мастер: ${b.master.name}` : ''}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{b.problemText}</p>
                </div>
                {statusSelect(b.id, b.status, 'booking')}
              </div>
            </div>
          ))}
          {bookings.length === 0 ? <p className="text-sm text-muted-foreground">Заявок пока нет</p> : null}
        </div>
      </section>
    </div>
  );
}
