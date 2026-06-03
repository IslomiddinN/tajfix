'use client';

import Link from 'next/link';
import { MessageSquare, Sparkles } from 'lucide-react';

export function AIHelperCard() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="badge">BETA</div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">TajFix AI</h2>
          <p className="mt-3 text-slate-600">Опишите проблему, и наш помощник подберет возможную причину и цену ремонта.</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-700">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-slate-800">
        <p className="text-sm">Пример:</p>
        <p className="mt-2 font-medium">Стиральная машина стучит при отжиме — что делать?</p>
      </div>
      <Link href="/ai" className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
        <MessageSquare className="h-4 w-4" /> Вызвать AI
      </Link>
    </div>
  );
}
