'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

interface RepairBooking {
  id: string;
  service: { title: string };
  status: string;
  address: string;
  estimatedPrice: number;
  preferredDate: string;
}

interface ProductOrder {
  id: string;
  totalAmount: number;
  status: string;
  address: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [repairs, setRepairs] = useState<RepairBooking[]>([]);
  const [products, setProducts] = useState<ProductOrder[]>([]);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setRepairs(data.bookings ?? []);
        setProducts(data.productOrders ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (repairs.length === 0 && products.length === 0) {
    return <EmptyState title="Нет заказов" description="Забронируйте мастера или оформите покупку техники." />;
  }

  return (
    <main className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-950">Мои заказы</h1>
        <p className="mt-2 text-slate-600">Статусы ремонта и покупок техники.</p>
      </div>

      <section className="space-y-6">
        {repairs.length > 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold text-slate-950">Ремонтные заявки</h2>
            <div className="mt-5 space-y-4">
              {repairs.map((repair) => (
                <div key={repair.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-950">{repair.service.title}</p>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">{repair.status.toLowerCase()}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{repair.address}</p>
                  <p className="mt-2 text-sm text-slate-700">Предполагаемая стоимость: {repair.estimatedPrice} сом</p>
                  <p className="mt-1 text-sm text-slate-500">Дата: {new Date(repair.preferredDate).toLocaleDateString('ru-RU')}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {products.length > 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold text-slate-950">Покупки</h2>
            <div className="mt-5 space-y-4">
              {products.map((order) => (
                <div key={order.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-950">Заказ #{order.id.slice(0, 8)}</p>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">{order.status.toLowerCase()}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">Адрес: {order.address}</p>
                  <p className="mt-2 text-sm text-slate-700">Сумма: {order.totalAmount} сом</p>
                  <p className="mt-1 text-sm text-slate-500">Дата: {new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
