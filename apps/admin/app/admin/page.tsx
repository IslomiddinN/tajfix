'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Users, Wallet, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalBookings: number;
  totalRevenue: number;
}

const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} сом`;

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
      <p className="mt-1 text-sm text-muted-foreground">Статистика сервиса и управление данными.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={Wallet} label="Выручка" value={fmtMoney(stats?.totalRevenue ?? 0)} accent />
        <Stat icon={Users} label="Пользователи" value={stats?.totalUsers ?? 0} />
        <Stat icon={ClipboardList} label="Заказы" value={stats?.totalOrders ?? 0} />
        <Stat icon={Wrench} label="Бронирования" value={stats?.totalBookings ?? 0} />
      </div>

      <div className="mt-5 rounded-3xl border border-border bg-card p-5">
        <h2 className="text-base font-bold text-foreground">Управление</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Меню слева: добавляйте, изменяйте и удаляйте товары, услуги и мастеров, меняйте статусы заказов и заявок,
          отвечайте в поддержке.
        </p>
      </div>
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
