'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { MasterCard } from '@/components/MasterCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

interface MasterItem {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  reviewsCount: number;
  distanceKm: number;
  priceFrom: number;
  avatarUrl: string;
}

export default function MastersPage() {
  const [masters, setMasters] = useState<MasterItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/masters')
      .then((res) => res.json())
      .then((data) => setMasters(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => masters.filter((master) => master.name.toLowerCase().includes(query.toLowerCase()) || master.specialization.toLowerCase().includes(query.toLowerCase())),
    [query, masters]
  );

  return (
    <main className="container py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Мастера</h1>
          <p className="mt-2 text-slate-600">Выберите специалиста для ремонта вашей техники.</p>
        </div>
        <div className="rounded-3xl bg-slate-50 px-5 py-3 text-sm text-slate-700">
          <Star className="inline h-4 w-4 text-amber-500" /> Рейтинг и отзывы
        </div>
      </div>
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по мастеру или специализации"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="Мастера не найдены" description="Попробуйте изменить критерии поиска." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((master) => (
            <MasterCard key={master.id} master={master as any} />
          ))}
        </div>
      )}
    </main>
  );
}
