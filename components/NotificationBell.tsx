'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { useUnreadNotifications } from '@/lib/useUnreadNotifications';

/**
 * Колокольчик уведомлений со счётчиком непрочитанных.
 * Рендерится только для авторизованных, опрашивает API раз в 20 секунд.
 * `href` — куда вести (в каждом приложении своя страница уведомлений).
 */
export function NotificationBell({
  variant = 'header',
  href = '/notifications'
}: {
  variant?: 'header' | 'hero';
  href?: string;
}) {
  const { status } = useSession();
  const unread = useUnreadNotifications();

  if (status !== 'authenticated') return null;

  const button =
    variant === 'hero'
      ? 'relative grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25'
      : 'relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground';

  return (
    <Link href={href} aria-label="Уведомления" className={button}>
      <Bell className="h-5 w-5" />
      {unread > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  );
}
