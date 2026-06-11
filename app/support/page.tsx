'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Headset, Send } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

interface Message {
  id: string;
  body: string;
  fromSupport: boolean;
  createdAt: string;
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

export default function SupportPage() {
  const { status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const res = await fetch('/api/support');
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages ?? []);
  };

  // Первая загрузка + поллинг новых сообщений каждые 4 секунды.
  useEffect(() => {
    if (status !== 'authenticated') {
      if (status === 'unauthenticated') setLoading(false);
      return;
    }
    load().finally(() => setLoading(false));
    const timer = setInterval(load, 4000);
    return () => clearInterval(timer);
  }, [status]);

  // Автопрокрутка вниз при новых сообщениях.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError('');
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: value })
    });
    setSending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.message ?? 'Не удалось отправить');
      return;
    }
    const msg: Message = await res.json();
    setText('');
    setMessages((prev) => [...prev, msg]);
  };

  if (loading) return <LoadingSpinner />;

  if (status === 'unauthenticated') {
    return (
      <main className="container py-10">
        <EmptyState
          title="Войдите в аккаунт"
          description="Чтобы написать в поддержку, войдите в свой аккаунт."
        />
        <div className="mt-4 text-center">
          <Link
            href="/login?callbackUrl=/support"
            className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Войти
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-4 sm:py-8">
      <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-2xl flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-card sm:h-[calc(100vh-12rem)]">
        {/* Шапка чата */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Headset className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">Поддержка TajFix</p>
            <p className="text-xs text-muted-foreground">Обычно отвечаем в течение дня</p>
          </div>
        </div>

        {/* Лента сообщений */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <Headset className="h-10 w-10 text-primary/40" />
              <p className="mt-3 text-sm">Напишите нам — поможем с заказом, ремонтом или товаром.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.fromSupport ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.fromSupport
                      ? 'rounded-bl-md bg-secondary text-foreground'
                      : 'rounded-br-md bg-primary text-primary-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      m.fromSupport ? 'text-muted-foreground' : 'text-primary-foreground/70'
                    }`}
                  >
                    {fmtTime(m.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Поле ввода */}
        <form onSubmit={send} className="border-t border-border p-3">
          {error ? <p className="mb-2 px-2 text-xs text-destructive">{error}</p> : null}
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(e);
                }
              }}
              rows={1}
              placeholder="Введите сообщение…"
              className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              aria-label="Отправить"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
