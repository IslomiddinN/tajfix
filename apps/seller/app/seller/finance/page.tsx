'use client';

import { useEffect, useMemo, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { fmtMoney, type OrderStatus } from '@/lib/master/store';

interface SaleItem {
  id: string;
  quantity: number;
  price: number;
  order: { id: string; status: OrderStatus; createdAt: string };
}

type Period = 'today' | 'week' | 'month' | 'all';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Сегодня' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'all', label: 'Всё время' }
];

// Платформа удерживает комиссию с завершённых продаж.
const FEE_RATE = 0.1;

export default function SellerFinancePage() {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('week');

  useEffect(() => {
    fetch('/api/seller/orders')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const finance = useMemo(() => {
    const cutoff = (() => {
      const d = new Date();
      if (period === 'today') d.setHours(0, 0, 0, 0);
      else if (period === 'week') d.setDate(d.getDate() - 7);
      else if (period === 'month') d.setMonth(d.getMonth() - 1);
      else return new Date(0);
      return d;
    })();
    const done = items.filter(
      (i) => i.order.status === 'COMPLETED' && new Date(i.order.createdAt) >= cutoff
    );
    const gross = done.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const fee = Math.round(gross * FEE_RATE);
    const net = gross - fee;
    const soldUnits = done.reduce((sum, i) => sum + i.quantity, 0);
    return { gross, fee, net, soldUnits, ordersCount: new Set(done.map((i) => i.order.id)).size };
  }, [items, period]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Финансы</h1>
        <p className="mt-2 text-muted-foreground">Доход по завершённым заказам с вашими товарами.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              period === p.key ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-secondary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Выручка</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{fmtMoney(finance.gross)}</p>
        </div>
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Комиссия ({Math.round(FEE_RATE * 100)}%)</p>
          <p className="mt-2 text-3xl font-semibold text-destructive">−{fmtMoney(finance.fee)}</p>
        </div>
        <div className="rounded-[32px] border border-green-500/30 bg-green-500/5 p-6 shadow-card">
          <p className="text-sm text-muted-foreground">К выплате</p>
          <p className="mt-2 text-3xl font-semibold text-green-500">{fmtMoney(finance.net)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Завершённых заказов</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{finance.ordersCount}</p>
        </div>
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Продано единиц</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{finance.soldUnits}</p>
        </div>
      </div>
    </div>
  );
}
