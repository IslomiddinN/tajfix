'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Star } from 'lucide-react';

export function ProductDetail({ product }: any) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    setLoading(true);
    setMessage('');
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity: 1 })
    });
    setLoading(false);
    if (!response.ok) {
      setMessage('Ошибка добавления в корзину');
      return;
    }
    setMessage('Товар добавлен в корзину');
  };

  return (
    <main className="container py-6 sm:py-10">
      <div className="mb-5 flex items-center gap-3 text-muted-foreground sm:mb-6">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Назад в магазин
        </Link>
      </div>
      <section className="rounded-[24px] border border-border bg-card p-4 shadow-card sm:rounded-[32px] sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[360px_1fr] sm:gap-8">
          <div className="rounded-3xl bg-secondary p-5 text-center sm:p-8">
            <img src={product.imageUrl} alt={product.title} className="mx-auto h-44 w-full object-contain sm:h-56" />
          </div>
          <div className="space-y-5 sm:space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground sm:text-sm">{product.brand}</p>
              <h1 className="mt-2 text-2xl font-semibold text-foreground sm:mt-3 sm:text-3xl">{product.title}</h1>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-amber-500" /> {product.rating.toFixed(1)} · {product.stock} в наличии
              </div>
            </div>
            <p className="text-muted-foreground">{product.description}</p>
            <div className="rounded-3xl border border-border bg-secondary p-5">
              <p className="text-sm text-muted-foreground">Цена</p>
              <div className="mt-2 flex items-center gap-4">
                <p className="text-3xl font-semibold text-foreground">{product.price} сом</p>
                {product.oldPrice ? <p className="text-sm text-muted-foreground line-through">{product.oldPrice} сом</p> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={addToCart} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
                <ShoppingBag className="h-4 w-4" /> В корзину
              </button>
              <Link href="/cart" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary">
                Перейти в корзину
              </Link>
            </div>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
