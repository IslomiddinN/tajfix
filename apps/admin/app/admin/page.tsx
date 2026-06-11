'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalBookings: number;
  totalRevenue: number;
}

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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Админ-панель</h1>
        <p className="mt-2 text-muted-foreground">Статистика сервиса и управление данными.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Пользователи</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{stats?.totalUsers ?? 0}</p>
        </div>
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Заказы</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{stats?.totalOrders ?? 0}</p>
        </div>
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Бронирования</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{stats?.totalBookings ?? 0}</p>
        </div>
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Выручка</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{stats?.totalRevenue ?? 0} сом</p>
        </div>
      </div>
      <div className="mt-8 rounded-[32px] border border-border bg-card p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-foreground">Управление</h2>
        <p className="mt-3 text-muted-foreground">
          Используйте меню слева: добавляйте, изменяйте и удаляйте товары, услуги и мастеров, меняйте статусы заказов и заявок.
        </p>
      </div>
    </div>
  );
}
