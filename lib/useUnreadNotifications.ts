'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { playNotificationSound, unlockAudio } from '@/lib/sound';

/**
 * Опрашивает /api/notifications и возвращает число непрочитанных.
 * При росте счётчика (после первой загрузки) проигрывает звук.
 * Звук разблокируется на первое касание/клик (требование браузеров).
 * Каждое приложение монорепо обслуживает свой /api/notifications — хук работает в любом из них.
 */
export function useUnreadNotifications(pollMs = 20000): number {
  const { status } = useSession();
  const [unread, setUnread] = useState(0);
  const prev = useRef<number | null>(null);

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
          if (prev.current !== null && next > prev.current) {
            playNotificationSound();
          }
          prev.current = next;
          setUnread(next);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, pollMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [status, pollMs]);

  return unread;
}
