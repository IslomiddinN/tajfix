'use client';

import { useState } from 'react';

const examples = [
  'Стиральная машина стучит при отжиме',
  'Кондиционер не запускается',
  'Холодильник не охлаждает',
  'Телевизор мерцает экран'
];

export default function AIPage() {
  const [problem, setProblem] = useState('');
  const [result, setResult] = useState<null | { reason: string; price: string; recommendation: string }>(null);
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: problem })
    });
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-border bg-card p-8 shadow-card">
        <h1 className="text-3xl font-semibold text-foreground">TajFix AI</h1>
        <p className="mt-3 text-muted-foreground">Попросите наше локальное AI-помощник оценить проблему техники и получить примерную стоимость ремонта.</p>

        <div className="mt-8 flex flex-col gap-4">
          <input
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            placeholder="Опишите проблему техники..."
            className="rounded-3xl border border-border bg-secondary px-5 py-4 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />
          <div className="flex flex-wrap gap-3">
            {examples.map((example) => (
              <button
                key={example}
                className="rounded-full border border-border bg-secondary px-4 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
                type="button"
                onClick={() => setProblem(example)}
              >
                {example}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={askAI}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Анализирую...' : 'Спросить AI'}
          </button>
        </div>

        {result ? (
          <div className="mt-8 rounded-3xl bg-secondary p-6">
            <h2 className="text-xl font-semibold text-foreground">Возможный диагноз</h2>
            <p className="mt-3 text-muted-foreground">{result.reason}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-card p-4 shadow-sm">
                <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Цена ремонта</h3>
                <p className="mt-3 text-xl font-semibold text-foreground">{result.price}</p>
              </div>
              <div className="rounded-3xl bg-card p-4 shadow-sm">
                <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Рекомендация</h3>
                <p className="mt-3 text-muted-foreground">{result.recommendation}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
