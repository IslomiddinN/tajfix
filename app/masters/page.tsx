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
    <main className="container py-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Мастера</h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">Выберите специалиста для ремонта вашей техники.</p>
        </div>
        <div className="self-start rounded-3xl bg-secondary px-4 py-2 text-sm text-muted-foreground sm:self-auto sm:px-5 sm:py-3">
          <Star className="inline h-4 w-4 text-amber-500" /> Рейтинг и отзывы
        </div>
      </div>
      <div className="mb-6 rounded-3xl border border-border bg-card p-4 shadow-card sm:mb-8 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по мастеру или специализации"
            className="w-full rounded-3xl border border-border bg-secondary py-3 pl-12 pr-4 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary sm:py-4"
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
