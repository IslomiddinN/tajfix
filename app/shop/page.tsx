'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

interface ProductItem {
  id: string;
  title: string;
  description: string;
  brand: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  imageUrl: string;
  rating: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => products.filter((product) => product.title.toLowerCase().includes(query.toLowerCase()) || product.brand.toLowerCase().includes(query.toLowerCase()) || product.description.toLowerCase().includes(query.toLowerCase())),
    [query, products]
  );

  return (
    <main className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-950">Магазин техники</h1>
        <p className="mt-2 text-slate-600">Выберите товар, добавьте в корзину и оформите заказ.</p>
      </div>
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по бренду, модели или категории"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="Товары не найдены" description="Попробуйте изменить запрос или выберите другую категорию." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </main>
  );
}
