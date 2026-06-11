'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Check, Star } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { fmtDateTime, useMasterStore } from '@/lib/master/store';

type Item = { id: string; kind: 'order' | 'done' | 'review'; title: string; text: string; at: string };

export default function MasterNotifications() {
  const router = useRouter();
  const { loading, bookings = [], reviews = [] } = useMasterStore();

  const items: Item[] = [
    ...bookings
      .filter((b) => b.status === 'NEW')
      .map<Item>((b) => ({
        id: `new-${b.id}`,
        kind: 'order',
        title: 'Новый заказ!',
        text: `${b.service.title} · ${b.address}`,
        at: b.createdAt
      })),
    ...bookings
      .filter((b) => b.status === 'COMPLETED')
      .slice(0, 10)
      .map<Item>((b) => ({
        id: `done-${b.id}`,
        kind: 'done',
        title: 'Заказ завершён',
        text: `${b.service.title} успешно закрыт`,
        at: b.createdAt
      })),
    ...reviews.slice(0, 10).map<Item>((r) => ({
      id: `rev-${r.id}`,
      kind: 'review',
      title: 'Новый отзыв',
      text: `${r.user.name ?? 'Клиент'} оценил(а) вашу работу на ${r.rating}★`,
      at: r.createdAt
    }))
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at));

  const ICONS = {
    order: { bg: 'bg-orange-500/15', color: 'text-orange-400', el: <Bell className="h-4 w-4" /> },
    done: { bg: 'bg-green-500/15', color: 'text-green-400', el: <Check className="h-4 w-4" /> },
    review: { bg: 'bg-yellow-500/15', color: 'text-yellow-400', el: <Star className="h-4 w-4" /> }
  } as const;

  return (
    <div className="px-5 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => router.push('/master')} className="grid h-10 w-10 place-items-center rounded-full bg-card">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Уведомления</h1>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
          Уведомлений пока нет
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const meta = ICONS[n.kind];
            return (
              <div key={n.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3 fade-up">
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${meta.bg} ${meta.color}`}>{meta.el}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.text}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{fmtDateTime(n.at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
