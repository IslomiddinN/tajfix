'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
      }}
      className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 shadow-lg shadow-black/10"
    >
      <Search className="h-5 w-5 shrink-0 text-slate-400" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Техника, бренд или поломка…"
        aria-label="Поиск"
        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
      <Link
        href="/ai"
        className="grid h-9 shrink-0 place-items-center rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground"
      >
        AI
      </Link>
    </form>
  );
}
