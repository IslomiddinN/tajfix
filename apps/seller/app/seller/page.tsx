'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Boxes, ClipboardList, PackageCheck, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Overview {
  seller: { shopName: string; description: string; logoUrl: string; phone: string };
  stats: { productsCount: number; ordersCount: number; revenue: number; pendingItems: number };
}

const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} сом`;

export default function SellerHomePage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/overview')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const seller = data?.seller;
  const stats = data?.stats;
  const shopName = seller?.shopName ?? 'Магазин';

  return (
    <div className="fade-up">
      {/* Шапка */}
      <div className="flex items-center gap-3">
        {seller?.logoUrl ? (
          <img src={seller.logoUrl} alt={shopName} className="h-12 w-12 rounded-2xl object-cover" />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-xl text-primary-foreground">
            🏪
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Кабинет продавца</p>
          <h1 className="truncate text-2xl font-bold leading-tight text-foreground">{shopName}</h1>
        </div>
      </div>

      {/* Метрики */}
      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={Wallet} label="Доход (завершённые)" value={fmtMoney(stats?.revenue ?? 0)} accent />
        <Stat icon={Boxes} label="Товаров" value={stats?.productsCount ?? 0} />
        <Stat icon={ClipboardList} label="Заказов с товарами" value={stats?.ordersCount ?? 0} />
        <Stat icon={PackageCheck} label="Ждут отгрузки" value={stats?.pendingItems ?? 0} />
      </div>

      {/* Быстрые действия */}
      <section className="mt-6">
        <h2 className="mb-3 text-base font-bold text-foreground">Быстрые действия</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            href="/seller/products"
            icon={Boxes}
            title="Управление товарами"
            desc="Добавляйте, редактируйте и удаляйте свои товары."
          />
          <ActionCard
            href="/seller/orders"
            icon={ClipboardList}
            title="Продажи"
            desc="Заказы с вашими товарами и готовность к отгрузке."
          />
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        accent ? 'bg-gradient-to-br from-primary to-blue-700 text-primary-foreground' : 'border border-border bg-card'
      }`}
    >
      <Icon className={`h-5 w-5 ${accent ? 'text-primary-foreground/90' : 'text-primary'}`} />
      <p className={`mt-2 text-2xl font-bold ${accent ? '' : 'text-foreground'}`}>{value}</p>
      <p className={`mt-0.5 text-[11px] ${accent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{label}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  desc
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-3xl border border-border bg-card p-5 transition hover:border-primary"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-primary" />
    </Link>
  );
}
