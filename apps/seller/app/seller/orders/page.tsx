'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Package } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { STATUS_LABEL, STATUS_COLOR, fmtMoney, fmtDateTime, type OrderStatus } from '@/lib/master/store';

interface SaleItem {
  id: string;
  quantity: number;
  price: number;
  fulfilled: boolean;
  product: { id: string; title: string; imageUrl: string };
  order: {
    id: string;
    status: OrderStatus;
    createdAt: string;
    address: string;
    phone: string;
    user: { name: string | null };
  };
}

interface OrderGroup {
  order: SaleItem['order'];
  items: SaleItem[];
  total: number;
}

export default function SellerOrdersPage() {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/orders')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo<OrderGroup[]>(() => {
    const map = new Map<string, OrderGroup>();
    for (const item of items) {
      const existing = map.get(item.order.id);
      if (existing) {
        existing.items.push(item);
        existing.total += item.price * item.quantity;
      } else {
        map.set(item.order.id, { order: item.order, items: [item], total: item.price * item.quantity });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime()
    );
  }, [items]);

  async function toggleFulfilled(item: SaleItem) {
    const next = !item.fulfilled;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, fulfilled: next } : i)));
    const res = await fetch(`/api/seller/orders/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fulfilled: next })
    });
    if (!res.ok) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, fulfilled: !next } : i)));
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-up">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">Продажи</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Заказы с вашими товарами. Статус заказа меняет администратор — вы отмечаете готовность позиции к отгрузке.
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState title="Продаж пока нет" description="Как только клиенты купят ваши товары, заказы появятся здесь." />
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.order.id} className="fade-up overflow-hidden rounded-3xl border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <p className="font-medium text-foreground">Заказ #{group.order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.order.user.name ?? 'Клиент'} · {fmtDateTime(group.order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{fmtMoney(group.total)}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[group.order.status]}`}>
                    {STATUS_LABEL[group.order.status]}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-border">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <img src={item.product.imageUrl} alt={item.product.title} className="h-12 w-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {item.price} сом
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFulfilled(item)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        item.fulfilled
                          ? 'border-green-500/40 bg-green-500/10 text-green-500'
                          : 'border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {item.fulfilled ? <Check className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
                      {item.fulfilled ? 'Готово к отгрузке' : 'Отметить готовым'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                📍 {group.order.address} · 📞 {group.order.phone}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
