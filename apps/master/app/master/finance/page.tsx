'use client';

import { useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { financeFor, fmtMoney, useMasterStore } from '@/lib/master/store';

const PERIODS = [
  { key: 'today', label: 'Сегодня' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'all', label: 'Всё' }
] as const;

export default function MasterFinance() {
  const { loading, bookings = [] } = useMasterStore();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['key']>('month');
  const f = financeFor(bookings, period);
  const max = Math.max(1, ...f.chart.map((c) => c.sum));

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-bold">Финансы</h1>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              period === p.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Money label="Заработано" value={fmtMoney(f.gross)} accent />
            <Money label="Комиссия 15%" value={fmtMoney(f.fee)} />
            <Money label="К выплате" value={fmtMoney(f.net)} accent />
            <Money label="Заказов" value={String(f.done.length)} />
          </div>

          <div className="mt-5 rounded-3xl bg-card p-4">
            <p className="text-sm font-semibold">Динамика доходов</p>
            <div className="mt-4 flex h-32 items-end gap-1">
              {f.chart.map((c, i) => (
                <div key={i} className="flex flex-1 flex-col items-center justify-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-primary/40 to-primary transition-all"
                    style={{
                      height: `${(c.sum / max) * 100}%`,
                      minHeight: c.sum > 0 ? 4 : 0,
                      animation: 'fadeUp .6s ease-out both',
                      animationDelay: `${i * 20}ms`
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-base font-bold">Доходы по заказам</h2>
            <div className="overflow-hidden rounded-2xl bg-card">
              <div className="grid grid-cols-12 gap-2 border-b border-border px-3 py-2 text-[10px] uppercase text-muted-foreground">
                <span className="col-span-5">Клиент</span>
                <span className="col-span-4 text-right">Сумма</span>
                <span className="col-span-3 text-right">Чистый</span>
              </div>
              {f.done.slice(0, 12).map((o) => (
                <div key={o.id} className="grid grid-cols-12 items-center gap-2 border-b border-border/50 px-3 py-2 text-xs last:border-0">
                  <span className="col-span-5 truncate">{o.user.name ?? 'Клиент'}</span>
                  <span className="col-span-4 text-right">{o.estimatedPrice}</span>
                  <span className="col-span-3 text-right font-semibold text-primary">{Math.round(o.estimatedPrice * 0.85)}</span>
                </div>
              ))}
              {f.done.length === 0 && <p className="px-3 py-6 text-center text-xs text-muted-foreground">Нет данных за период</p>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Money({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? 'bg-gradient-to-br from-primary to-blue-700 text-primary-foreground' : 'bg-card'}`}>
      <p className={`text-[11px] ${accent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
