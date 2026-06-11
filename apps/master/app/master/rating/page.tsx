'use client';

import { Star } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { fmtDate, useMasterStore } from '@/lib/master/store';

export default function MasterRating() {
  const { loading, reviews = [] } = useMasterStore();
  const total = reviews.length;
  const avg = total ? reviews.reduce((a, r) => a + r.rating, 0) / total : 0;
  const buckets = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-bold">Рейтинг</h1>

      <div className="mt-4 rounded-3xl bg-gradient-to-br from-card to-surface-2 p-6 text-center">
        <div className="inline-flex items-center gap-2">
          <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
          <span className="text-5xl font-black">{avg.toFixed(1)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">из 5.0 на основе {total} отзывов</p>

        <div className="mt-5 space-y-2">
          {buckets.map((b) => (
            <div key={b.n} className="flex items-center gap-3 text-xs">
              <span className="w-4 text-right">{b.n}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${total ? (b.c / total) * 100 : 0}%` }} />
              </div>
              <span className="w-6 text-left text-muted-foreground">{b.c}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-bold">Отзывы</h2>
        {total === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            Отзывов пока нет
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => {
              const name = r.user.name ?? 'Клиент';
              return (
                <article key={r.id} className="fade-up rounded-2xl bg-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">{name[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{name}</p>
                        <span className="text-[10px] text-muted-foreground">{fmtDate(r.createdAt)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                        ))}
                      </div>
                      <p className="mt-2 text-sm">{r.comment}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
