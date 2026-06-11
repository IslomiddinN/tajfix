'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ThreadUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}
interface Message {
  id: string;
  body: string;
  fromSupport: boolean;
  createdAt: string;
}
interface ThreadListItem {
  id: string;
  status: 'OPEN' | 'CLOSED';
  updatedAt: string;
  user: ThreadUser;
  lastMessage: Message | null;
}
interface ThreadDetail {
  id: string;
  status: 'OPEN' | 'CLOSED';
  user: ThreadUser;
  messages: Message[];
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AdminSupportPage() {
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ThreadDetail | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadList = async () => {
    const res = await fetch('/api/admin/support');
    if (res.ok) setThreads(await res.json());
  };

  const loadDetail = async (id: string) => {
    const res = await fetch(`/api/admin/support/${id}`);
    if (res.ok) setDetail(await res.json());
  };

  useEffect(() => {
    loadList().finally(() => setLoading(false));
    const timer = setInterval(loadList, 6000);
    return () => clearInterval(timer);
  }, []);

  // Поллинг открытого диалога.
  useEffect(() => {
    if (!activeId) {
      setDetail(null);
      return;
    }
    loadDetail(activeId);
    const timer = setInterval(() => loadDetail(activeId), 4000);
    return () => clearInterval(timer);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [detail?.messages.length]);

  const reply = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || !activeId || sending) return;
    setSending(true);
    const res = await fetch(`/api/admin/support/${activeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: value })
    });
    setSending(false);
    if (res.ok) {
      const msg: Message = await res.json();
      setText('');
      setDetail((prev) => (prev ? { ...prev, messages: [...prev.messages, msg] } : prev));
      loadList();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Поддержка</h1>
        <p className="mt-2 text-muted-foreground">Диалоги с клиентами — отвечайте на вопросы.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Список диалогов (на мобиле скрывается, когда открыт диалог) */}
        <div className={`space-y-2 ${activeId ? 'hidden lg:block' : ''}`}>
          {threads.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Диалогов пока нет</p>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  activeId === t.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-foreground">{t.user.name}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      t.status === 'OPEN' ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {t.status === 'OPEN' ? 'Открыт' : 'Закрыт'}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {t.lastMessage ? `${t.lastMessage.fromSupport ? 'Вы: ' : ''}${t.lastMessage.body}` : 'Нет сообщений'}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">{fmtTime(t.updatedAt)}</p>
              </button>
            ))
          )}
        </div>

        {/* Переписка */}
        <div className={`${activeId ? '' : 'hidden lg:block'}`}>
          {!detail ? (
            <div className="grid h-[60vh] place-items-center rounded-[28px] border border-border bg-card text-sm text-muted-foreground">
              Выберите диалог слева
            </div>
          ) : (
            <div className="flex h-[70vh] flex-col overflow-hidden rounded-[28px] border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <button
                  onClick={() => setActiveId(null)}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary lg:hidden"
                  aria-label="Назад"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{detail.user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{detail.user.phone} · {detail.user.email}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {detail.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.fromSupport ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.fromSupport
                          ? 'rounded-br-md bg-primary text-primary-foreground'
                          : 'rounded-bl-md bg-secondary text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p
                        className={`mt-1 text-right text-[10px] ${
                          m.fromSupport ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {fmtTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={reply} className="border-t border-border p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        reply(e);
                      }
                    }}
                    rows={1}
                    placeholder="Ответ клиенту…"
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
          )}
        </div>
      </div>
    </div>
  );
}
