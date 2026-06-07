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
    <main className="container py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Мои заказы</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">Статусы ремонта и покупок техники.</p>
      </div>

      <section className="space-y-5 sm:space-y-6">
        {repairs.length > 0 ? (
          <div className="rounded-[28px] border border-border bg-card p-5 shadow-card sm:rounded-[32px] sm:p-6">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Ремонтные заявки</h2>
            <div className="mt-5 space-y-4">
              {repairs.map((repair) => (
                <div key={repair.id} className="rounded-3xl border border-border bg-secondary p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-foreground">{repair.service.title}</p>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{repair.status.toLowerCase()}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{repair.address}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Предполагаемая стоимость: {repair.estimatedPrice} сом</p>
                  <p className="mt-1 text-sm text-muted-foreground">Дата: {new Date(repair.preferredDate).toLocaleDateString('ru-RU')}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {products.length > 0 ? (
          <div className="rounded-[28px] border border-border bg-card p-5 shadow-card sm:rounded-[32px] sm:p-6">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Покупки</h2>
            <div className="mt-5 space-y-4">
              {products.map((order) => (
                <div key={order.id} className="rounded-3xl border border-border bg-secondary p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-foreground">Заказ #{order.id.slice(0, 8)}</p>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{order.status.toLowerCase()}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Адрес: {order.address}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Сумма: {order.totalAmount} сом</p>
                  <p className="mt-1 text-sm text-muted-foreground">Дата: {new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
