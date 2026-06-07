'use client';

import Link from 'next/link';
import { Bell, Power } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  applianceIcon,
  fmtMoney,
  fmtTime,
  isActive,
  NEXT_STATUS,
  STATUS_COLOR,
  STATUS_LABEL,
  useMasterStore,
  useStats,
  type Booking
} from '@/lib/master/store';

export default function MasterHome() {
  const { loading, forbidden, master, bookings = [], reviews = [], setBookingStatus, toggleOnline } = useMasterStore();
  const stats = useStats(bookings, reviews);

  if (loading) return <LoadingSpinner />;
  if (forbidden || !master) {
    return (
      <div className="px-5 pt-10">
        <EmptyState title="Нет доступа" description="Этот раздел доступен только мастерам сервиса." />
      </div>
    );
  }

  const firstName = master.name.split(' ')[0] || master.name;
  const news = bookings.filter((o) => o.status === 'NEW');
  const active = bookings.filter((o) => isActive(o.status));
  const unread = news.length;

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-base font-bold text-primary-foreground">
            {firstName[0]}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Привет,</p>
            <p className="text-base font-semibold leading-tight">{firstName}!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle className="grid h-10 w-10 place-items-center rounded-full bg-card text-muted-foreground transition hover:text-foreground" />
          <Link href="/master/notifications" className="relative grid h-10 w-10 place-items-center rounded-full bg-card">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Online toggle */}
      <button
        onClick={toggleOnline}
        className={`mt-5 flex w-full items-center justify-between rounded-3xl border p-4 transition ${
          master.isAvailable ? 'border-green-500/40 bg-green-500/10' : 'border-border bg-card'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`grid h-11 w-11 place-items-center rounded-2xl ${
              master.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Power className="h-5 w-5" />
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold">{master.isAvailable ? 'Вы доступны' : 'Вы оффлайн'}</p>
            <p className="text-xs text-muted-foreground">
              {master.isAvailable ? 'Получаете новые заказы' : 'Заказы не приходят'}
            </p>
          </div>
        </div>
        <span className={`relative h-7 w-12 rounded-full ${master.isAvailable ? 'bg-green-500' : 'bg-muted'}`}>
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
              master.isAvailable ? 'left-5' : 'left-0.5'
            }`}
          />
        </span>
      </button>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-4 gap-2">
        <Stat value={stats.todayCount} label="Сегодня" />
        <Stat value={fmtMoney(stats.earnedToday)} label="Доход" small />
        <Stat value={stats.rating.toFixed(1) + ' ★'} label="Рейтинг" />
        <Stat value={stats.completed} label="Всего" />
      </div>

      {/* New orders */}
      <Section title="Новые заказы" badge={news.length}>
        {news.length === 0 && <Empty text="Новых заказов пока нет" />}
        {news.map((o) => (
          <NewOrderCard key={o.id} order={o} onAccept={() => setBookingStatus(o.id, 'CONFIRMED')} onReject={() => setBookingStatus(o.id, 'CANCELLED')} />
        ))}
      </Section>

      <Section title="В работе" badge={active.length}>
        {active.length === 0 && <Empty text="Нет активных заказов" />}
        {active.map((o) => (
          <ActiveOrderCard key={o.id} order={o} onNext={(next) => setBookingStatus(o.id, next)} />
        ))}
      </Section>
    </div>
  );
}

function Stat({ value, label, small }: { value: React.ReactNode; label: string; small?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-3">
      <p className={`font-bold ${small ? 'text-sm' : 'text-lg'}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Section({ title, badge, children }: { title: string; badge?: number; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold">{title}</h2>
        {typeof badge === 'number' && (
          <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">{badge}</span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function NewOrderCard({ order, onAccept, onReject }: { order: Booking; onAccept: () => void; onReject: () => void }) {
  return (
    <div className="pulse-new fade-up rounded-3xl border border-orange-500/30 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/15 text-xl">{applianceIcon(order.service.title)}</span>
          <div>
            <p className="text-sm font-semibold leading-tight">{order.service.title}</p>
            <p className="text-xs text-muted-foreground">{order.address}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-primary">{fmtMoney(order.estimatedPrice)}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">⏱ {fmtTime(order.createdAt)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={onAccept} className="h-10 rounded-xl bg-green-500 font-semibold text-white">
          Принять
        </button>
        <button onClick={onReject} className="h-10 rounded-xl bg-destructive/15 font-semibold text-destructive">
          Отклонить
        </button>
      </div>
    </div>
  );
}

function ActiveOrderCard({ order, onNext }: { order: Booking; onNext: (next: Booking['status']) => void }) {
  const next = NEXT_STATUS[order.status];
  return (
    <Link href={`/master/orders/${order.id}`} className="block fade-up rounded-3xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-xl">{applianceIcon(order.service.title)}</span>
          <div>
            <p className="text-sm font-semibold leading-tight">{order.service.title}</p>
            <p className="text-xs text-muted-foreground">{order.user.name ?? 'Клиент'}</p>
          </div>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>
      {next && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onNext(next.next);
          }}
          className="mt-3 h-10 w-full rounded-xl bg-primary font-semibold text-primary-foreground"
        >
          {next.label}
        </button>
      )}
    </Link>
  );
}
