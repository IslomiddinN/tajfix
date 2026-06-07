'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Master {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  specialization: string;
  description: string;
  rating: number;
  reviewsCount: number;
  distanceKm: number;
  priceFrom: number;
  guaranteeText: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  status: OrderStatus;
  problemText: string;
  address: string;
  phone: string;
  preferredDate: string;
  estimatedPrice: number;
  createdAt: string;
  service: { id: string; title: string };
  user: { name: string | null; phone: string | null };
}

export interface MasterReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string | null };
}

interface OverviewData {
  master: Master;
  bookings: Booking[];
  reviews: MasterReview[];
}

export type EditableMaster = Pick<
  Master,
  'name' | 'phone' | 'specialization' | 'description' | 'guaranteeText' | 'avatarUrl' | 'priceFrom'
>;

interface StoreValue extends Partial<OverviewData> {
  loading: boolean;
  forbidden: boolean;
  setBookingStatus: (id: string, status: OrderStatus, finalPrice?: number) => Promise<void>;
  toggleOnline: () => Promise<void>;
  updateProfile: (data: Partial<EditableMaster>) => Promise<{ ok: boolean; message?: string }>;
}

const Ctx = createContext<StoreValue | null>(null);

export function MasterStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/master/overview')
      .then(async (res) => {
        if (res.status === 403 || res.status === 404) {
          if (active) setForbidden(true);
          return null;
        }
        return res.json();
      })
      .then((d) => {
        if (active && d) setData(d);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const setBookingStatus = useCallback(async (id: string, status: OrderStatus, finalPrice?: number) => {
    const res = await fetch(`/api/master/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, finalPrice })
    });
    if (res.ok) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              bookings: prev.bookings.map((b) =>
                b.id === id
                  ? { ...b, status, estimatedPrice: finalPrice && status === 'COMPLETED' ? Math.round(finalPrice) : b.estimatedPrice }
                  : b
              )
            }
          : prev
      );
    }
  }, []);

  const toggleOnline = useCallback(async () => {
    setData((prev) => (prev ? { ...prev, master: { ...prev.master, isAvailable: !prev.master.isAvailable } } : prev));
    const next = !data?.master.isAvailable;
    await fetch('/api/master/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: next })
    }).catch(() => {});
  }, [data?.master.isAvailable]);

  const updateProfile = useCallback(async (patch: Partial<EditableMaster>) => {
    const res = await fetch('/api/master/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, message: err.message ?? 'Не удалось сохранить' };
    }
    const updated = (await res.json()) as Master;
    setData((prev) => (prev ? { ...prev, master: { ...prev.master, ...updated } } : prev));
    return { ok: true };
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      loading,
      forbidden,
      master: data?.master,
      bookings: data?.bookings,
      reviews: data?.reviews,
      setBookingStatus,
      toggleOnline,
      updateProfile
    }),
    [loading, forbidden, data, setBookingStatus, toggleOnline, updateProfile]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMasterStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMasterStore must be used within MasterStoreProvider');
  return ctx;
}

/* ---------- helpers ---------- */

export const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} с.`;
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
export const fmtDateTime = (iso: string) => `${fmtDate(iso)} ${fmtTime(iso)}`;

export const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: 'Новая',
  CONFIRMED: 'Принята',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена'
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  NEW: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  CONFIRMED: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  IN_PROGRESS: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  COMPLETED: 'bg-green-500/15 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/30'
};

export const NEXT_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  CONFIRMED: { next: 'IN_PROGRESS', label: 'Начать ремонт' },
  IN_PROGRESS: { next: 'COMPLETED', label: 'Завершить заказ' }
};

const ICON_RULES: { match: RegExp; icon: string }[] = [
  { match: /стиральн/i, icon: '🧺' },
  { match: /холодильник|морозиль/i, icon: '❄️' },
  { match: /кондицион|сплит/i, icon: '💨' },
  { match: /телевизор|тв\b/i, icon: '📺' },
  { match: /посудомо/i, icon: '🍽️' },
  { match: /плит|духов|варочн/i, icon: '🔥' },
  { match: /микроволнов|свч/i, icon: '📡' },
  { match: /пылесос/i, icon: '🧹' }
];

export const applianceIcon = (title: string) => ICON_RULES.find((r) => r.match.test(title))?.icon ?? '🔧';

const ACTIVE: OrderStatus[] = ['CONFIRMED', 'IN_PROGRESS'];
export const isActive = (s: OrderStatus) => ACTIVE.includes(s);

export function useStats(bookings: Booking[] = [], reviews: MasterReview[] = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todays = bookings.filter((b) => new Date(b.createdAt) >= today);
  const earnedToday = todays
    .filter((b) => b.status === 'COMPLETED')
    .reduce((a, b) => a + b.estimatedPrice, 0);
  const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
  const rating = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  return { todayCount: todays.length, earnedToday, rating, completed };
}

export function financeFor(bookings: Booking[], period: 'today' | 'week' | 'month' | 'all') {
  const cutoff = (() => {
    const d = new Date();
    if (period === 'today') d.setHours(0, 0, 0, 0);
    else if (period === 'week') d.setDate(d.getDate() - 7);
    else if (period === 'month') d.setMonth(d.getMonth() - 1);
    else return new Date(0);
    return d;
  })();
  const done = bookings.filter((b) => b.status === 'COMPLETED' && new Date(b.createdAt) >= cutoff);
  const gross = done.reduce((a, b) => a + b.estimatedPrice, 0);
  const fee = Math.round(gross * 0.15);
  const net = gross - fee;
  const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
  const chart = Array.from({ length: days }).map((_, i) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (days - 1 - i));
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const sum = bookings
      .filter((b) => b.status === 'COMPLETED' && new Date(b.createdAt) >= day && new Date(b.createdAt) < next)
      .reduce((a, b) => a + b.estimatedPrice, 0);
    return { day, sum };
  });
  return { gross, fee, net, done, chart };
}
