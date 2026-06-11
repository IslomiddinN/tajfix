'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BellRing, BellOff } from 'lucide-react';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * Включение/выключение web-push на текущем устройстве.
 * Push работает только в защищённом контексте (HTTPS или localhost).
 */
export function PushToggle() {
  const { status } = useSession();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !!VAPID_PUBLIC;
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub && Notification.permission === 'granted'))
      .catch(() => {});
  }, []);

  if (status !== 'authenticated' || supported === null) return null;

  if (!supported) {
    return (
      <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Push-уведомления недоступны в этом браузере. Откройте сайт по HTTPS (или добавьте на главный экран на iPhone).
      </div>
    );
  }

  const enable = async () => {
    setBusy(true);
    setError('');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setError('Вы не разрешили уведомления. Включите их в настройках браузера.');
        setBusy(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC as string)
      });
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys })
      });
      if (!res.ok) throw new Error();
      setEnabled(true);
    } catch {
      setError('Не удалось включить push-уведомления.');
    }
    setBusy(false);
  };

  const disable = async () => {
    setBusy(true);
    setError('');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint })
        });
        await sub.unsubscribe();
      }
      setEnabled(false);
    } catch {
      setError('Не удалось отключить.');
    }
    setBusy(false);
  };

  return (
    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          enabled ? 'bg-green-500/15 text-green-500' : 'bg-primary/10 text-primary'
        }`}
      >
        {enabled ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {enabled ? 'Push-уведомления включены' : 'Уведомления на телефон'}
        </p>
        <p className="text-xs text-muted-foreground">
          {enabled ? 'Приходят, даже когда сайт закрыт.' : 'Получайте уведомления, даже когда сайт закрыт.'}
        </p>
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
      <button
        onClick={enabled ? disable : enable}
        disabled={busy}
        className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${
          enabled
            ? 'border border-border text-muted-foreground hover:bg-secondary'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {busy ? '…' : enabled ? 'Отключить' : 'Включить'}
      </button>
    </div>
  );
}
