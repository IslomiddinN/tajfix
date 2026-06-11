'use client';

import { useEffect } from 'react';

/**
 * Глобальная регистрация service worker — нужна для установки PWA и web-push.
 * Ничего не рендерит.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
