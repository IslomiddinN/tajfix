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
        <h1 className="text-3xl font-semibold text-slate-950">Админ-панель</h1>
        <p className="mt-2 text-slate-600">Статистика сервиса и управление данными.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm text-slate-500">Пользователи</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats?.totalUsers ?? 0}</p>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm text-slate-500">Заказы</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats?.totalOrders ?? 0}</p>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm text-slate-500">Бронирования</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats?.totalBookings ?? 0}</p>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm text-slate-500">Выручка</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats?.totalRevenue ?? 0} сом</p>
        </div>
      </div>
      <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-slate-950">Управление</h2>
        <p className="mt-3 text-slate-600">
          Используйте меню слева: добавляйте, изменяйте и удаляйте товары, услуги и мастеров, меняйте статусы заказов и заявок.
        </p>
      </div>
    </div>
  );
}
