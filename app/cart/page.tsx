'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, Wallet } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
  };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/cart')
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function changeQuantity(item: CartItem, delta: number) {
    const quantity = item.quantity + delta;
    if (quantity < 1) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/cart/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (res.ok) {
        setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, quantity } : it)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (items.length === 0) {
    return <EmptyState title="Корзина пуста" description="Добавьте товары из магазина, чтобы оформить заказ." />;
  }

  return (
    <main className="container py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Корзина</h1>
          <p className="mt-2 text-muted-foreground">Проверьте товары перед оформлением заказа.</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-[32px] border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-4">
                <img src={item.product.imageUrl} alt={item.product.title} className="h-24 w-24 rounded-3xl object-contain" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground">{item.product.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.product.price} сом / шт.</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center gap-3 rounded-full border border-border px-2 py-1">
                      <button
                        type="button"
                        aria-label="Уменьшить"
                        disabled={busyId === item.id || item.quantity <= 1}
                        onClick={() => changeQuantity(item, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-medium text-foreground">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Увеличить"
                        disabled={busyId === item.id}
                        onClick={() => changeQuantity(item, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" /> Удалить
                    </button>
                  </div>
                </div>
                <p className="self-start text-lg font-semibold text-foreground">{item.product.price * item.quantity} сом</p>
              </div>
            </div>
          ))}
        </div>
        <div className="h-fit rounded-[32px] border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Итого</h2>
          <p className="mt-4 text-3xl font-semibold text-foreground">{total} сом</p>
          <div className="mt-4 flex items-center gap-2 rounded-3xl bg-secondary p-4 text-sm text-muted-foreground">
            <Wallet className="h-5 w-5 text-emerald-600" /> Оплата наличными при получении
          </div>
          <Link href="/checkout" className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Оформить заказ
          </Link>
        </div>
      </div>
    </main>
  );
}
