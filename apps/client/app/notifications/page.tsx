'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, CheckCheck, ClipboardList, Headset, ShoppingBag, Wrench } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PushToggle } from '@/components/PushToggle';

interface Notification {
  id: string;
  type: 'order' | 'booking' | 'support' | 'sale' | 'system';
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const ICONS: Record<Notification['type'], { el: React.ReactNode; cls: string }> = {
  order: { el: <ClipboardList className="h-4 w-4" />, cls: 'bg-primary/15 text-primary' },
  booking: { el: <Wrench className="h-4 w-4" />, cls: 'bg-orange-500/15 text-orange-500' },
  support: { el: <Headset className="h-4 w-4" />, cls: 'bg-blue-500/15 text-blue-500' },
  sale: { el: <ShoppingBag className="h-4 w-4" />, cls: 'bg-green-500/15 text-green-500' },
  system: { el: <Bell className="h-4 w-4" />, cls: 'bg-secondary text-muted-foreground' }
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} дн назад`;
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

export default function NotificationsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }
    if (status !== 'authenticated') return;
    fetch('/api/notifications')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setItems(d.items ?? []);
        // Помечаем все прочитанными — счётчик в колокольчике обнулится.
        fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ all: true })
        });
      })
      .finally(() => setLoading(false));
  }, [status]);

  if (status === 'unauthenticated') {
    return (
      <main className="container py-10">
        <EmptyState title="Войдите в аккаунт" description="Уведомления доступны авторизованным пользователям." />
        <div className="mt-4 text-center">
          <Link
            href="/login?callbackUrl=/notifications"
            className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Войти
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Уведомления</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Заказы, заявки, поддержка и продажи.</p>

        <PushToggle />

        {loading ? (
          <ul className="mt-6 space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-secondary" />
                <div className="flex-1 space-y-2 py-0.5">
                  <span className="block h-3.5 w-1/3 animate-pulse rounded bg-secondary" />
                  <span className="block h-3 w-2/3 animate-pulse rounded bg-secondary" />
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-[28px] border border-dashed border-border bg-card/40 py-16 text-center">
            <CheckCheck className="h-10 w-10 text-primary/40" />
            <p className="mt-3 text-sm text-muted-foreground">Уведомлений пока нет</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-2">
            {items.map((n) => {
              const meta = ICONS[n.type] ?? ICONS.system;
              const inner = (
                <div
                  className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                    n.read ? 'border-border bg-card' : 'border-primary/30 bg-primary/5'
                  } ${n.link ? 'hover:border-primary' : ''}`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${meta.cls}`}>{meta.el}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      {!n.read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                    </div>
                    {n.body ? <p className="mt-0.5 break-words text-sm text-muted-foreground">{n.body}</p> : null}
                    <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              );
              return (
                <li key={n.id}>
                  {n.link ? (
                    <button type="button" onClick={() => router.push(n.link)} className="block w-full text-left">
                      {inner}
                    </button>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
