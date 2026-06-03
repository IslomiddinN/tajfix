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
    <main className="container py-10">
      <div className="mb-6 flex items-center gap-3 text-slate-600">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Назад в магазин
        </Link>
      </div>
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl bg-slate-50 p-8 text-center">
            <img src={product.imageUrl} alt={product.title} className="mx-auto h-56 w-full object-contain" />
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{product.brand}</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">{product.title}</h1>
              <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                <Star className="h-4 w-4 text-amber-500" /> {product.rating.toFixed(1)} · {product.stock} в наличии
              </div>
            </div>
            <p className="text-slate-600">{product.description}</p>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Цена</p>
              <div className="mt-2 flex items-center gap-4">
                <p className="text-3xl font-semibold text-slate-950">{product.price} сом</p>
                {product.oldPrice ? <p className="text-sm text-slate-500 line-through">{product.oldPrice} сом</p> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={addToCart} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                <ShoppingBag className="h-4 w-4" /> В корзину
              </button>
              <Link href="/cart" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Перейти в корзину
              </Link>
            </div>
            {message ? <p className="text-sm text-slate-700">{message}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
