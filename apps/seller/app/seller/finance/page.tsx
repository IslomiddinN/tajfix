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
    <div className="fade-up">
      <h1 className="text-2xl font-bold text-foreground">Финансы</h1>
      <p className="mt-1 text-sm text-muted-foreground">Доход по завершённым заказам с вашими товарами.</p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              period === p.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-secondary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Money label="Выручка" value={fmtMoney(finance.gross)} />
        <Money label={`Комиссия ${Math.round(FEE_RATE * 100)}%`} value={`−${fmtMoney(finance.fee)}`} />
        <Money label="К выплате" value={fmtMoney(finance.net)} accent />
        <Money label="Заказов" value={String(finance.ordersCount)} />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-bold text-foreground">Итоги периода</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <Row label="Завершённых заказов" value={String(finance.ordersCount)} />
          <Row label="Продано единиц" value={String(finance.soldUnits)} />
          <Row label="Комиссия платформы" value={`${Math.round(FEE_RATE * 100)}%`} />
        </div>
      </section>
    </div>
  );
}

function Money({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        accent ? 'bg-gradient-to-br from-primary to-blue-700 text-primary-foreground' : 'border border-border bg-card'
      }`}
    >
      <p className={`text-[11px] ${accent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
