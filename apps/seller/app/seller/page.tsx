'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Boxes, ClipboardList, PackageCheck, Wallet } from 'lucide-react';
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

  const stats = data?.stats;

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        {data?.seller.logoUrl ? (
          <img src={data.seller.logoUrl} alt={data.seller.shopName} className="h-14 w-14 rounded-2xl object-cover" />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-2xl">🏪</div>
        )}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{data?.seller.shopName ?? 'Магазин'}</h1>
          <p className="mt-1 text-muted-foreground">Кабинет продавца — товары, продажи и доход.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Boxes} label="Товаров" value={stats?.productsCount ?? 0} />
        <StatCard icon={ClipboardList} label="Заказов с моими товарами" value={stats?.ordersCount ?? 0} />
        <StatCard icon={Wallet} label="Доход (завершённые)" value={fmtMoney(stats?.revenue ?? 0)} />
        <StatCard icon={PackageCheck} label="Ждут отгрузки" value={stats?.pendingItems ?? 0} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/seller/products"
          className="rounded-[32px] border border-border bg-card p-8 shadow-card transition hover:border-primary"
        >
          <Boxes className="h-7 w-7 text-primary" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Управление товарами</h2>
          <p className="mt-2 text-muted-foreground">Добавляйте, редактируйте и удаляйте свои товары в магазине.</p>
        </Link>
        <Link
          href="/seller/orders"
          className="rounded-[32px] border border-border bg-card p-8 shadow-card transition hover:border-primary"
        >
          <ClipboardList className="h-7 w-7 text-primary" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Продажи</h2>
          <p className="mt-2 text-muted-foreground">Заказы с вашими товарами и отметка готовности к отгрузке.</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[32px] border border-border bg-card p-6 shadow-card">
      <Icon className="h-6 w-6 text-primary" />
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
