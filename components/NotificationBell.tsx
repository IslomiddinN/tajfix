'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { playNotificationSound, unlockAudio } from '@/lib/sound';

/**
 * Колокольчик уведомлений со счётчиком непрочитанных.
 * Рендерится только для авторизованных, опрашивает API раз в 20 секунд.
 */
export function NotificationBell({ variant = 'header' }: { variant?: 'header' | 'hero' }) {
  const { status } = useSession();
  const [unread, setUnread] = useState(0);
  // null до первой загрузки — чтобы не пиликать на стартовом значении.
  const prevUnread = useRef<number | null>(null);

  // Разблокируем звук на первое действие пользователя (требование браузеров).
  useEffect(() => {
    const onInteract = () => unlockAudio();
    window.addEventListener('pointerdown', onInteract, { once: true });
    return () => window.removeEventListener('pointerdown', onInteract);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let active = true;
    const load = () =>
      fetch('/api/notifications')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!active || !d) return;
          const next = d.unread ?? 0;
          // Звук только при росте счётчика после первой загрузки.
          if (prevUnread.current !== null && next > prevUnread.current) {
            playNotificationSound();
          }
          prevUnread.current = next;
          setUnread(next);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [status]);

  if (status !== 'authenticated') return null;

  const button =
    variant === 'hero'
      ? 'relative grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25'
      : 'relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground';

  return (
    <Link href="/notifications" aria-label="Уведомления" className={button}>
      <Bell className="h-5 w-5" />
      {unread > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  );
}
