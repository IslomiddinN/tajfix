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
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
        <h1 className="text-3xl font-semibold text-slate-950">TajFix AI</h1>
        <p className="mt-3 text-slate-600">Попросите наше локальное AI-помощник оценить проблему техники и получить примерную стоимость ремонта.</p>

        <div className="mt-8 flex flex-col gap-4">
          <input
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            placeholder="Опишите проблему техники..."
            className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
          <div className="flex flex-wrap gap-3">
            {examples.map((example) => (
              <button
                key={example}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
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
            className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Анализирую...' : 'Спросить AI'}
          </button>
        </div>

        {result ? (
          <div className="mt-8 rounded-3xl bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-950">Возможный диагноз</h2>
            <p className="mt-3 text-slate-700">{result.reason}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Цена ремонта</h3>
                <p className="mt-3 text-xl font-semibold text-slate-950">{result.price}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Рекомендация</h3>
                <p className="mt-3 text-slate-700">{result.recommendation}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
