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
    <main className="container py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Услуги</h1>
          <p className="mt-2 text-slate-600">Поиск мастера и вызов специалиста на дом.</p>
        </div>
        <Link href="/ai" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Воспользоваться AI
        </Link>
      </div>
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по технике или проблеме"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
