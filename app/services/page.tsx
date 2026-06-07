'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { ServiceCard } from '@/components/ServiceCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  priceFrom: number;
  isUrgentAvailable: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => services.filter((service) => service.title.toLowerCase().includes(query.toLowerCase()) || service.description.toLowerCase().includes(query.toLowerCase())),
    [query, services]
  );

  return (
    <main className="container py-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Услуги</h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">Поиск мастера и вызов специалиста на дом.</p>
        </div>
        <Link href="/ai" className="self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:self-auto sm:py-3">
          Воспользоваться AI
        </Link>
      </div>
      <div className="mb-6 rounded-3xl border border-border bg-card p-4 shadow-card sm:mb-8 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по технике или проблеме"
            className="w-full rounded-3xl border border-border bg-secondary py-3 pl-12 pr-4 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary sm:py-4"
          />
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="Услуги не найдены" description="Попробуйте изменить запрос или выберите другую категорию." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service as any} />
          ))}
        </div>
      )}
    </main>
  );
}
