'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BarChart3, Boxes, ClipboardList, User, Wallet } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

const links = [
  { href: '/seller', label: 'Обзор', icon: BarChart3 },
  { href: '/seller/products', label: 'Мои товары', icon: Boxes },
  { href: '/seller/orders', label: 'Продажи', icon: ClipboardList },
  { href: '/seller/finance', label: 'Финансы', icon: Wallet },
  { href: '/seller/profile', label: 'Профиль', icon: User }
];

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <main className="container py-10">
        <LoadingSpinner />
      </main>
    );
  }

  if (session?.user?.role !== 'SELLER') {
    return (
      <main className="container py-10">
        <EmptyState
          title="Нет доступа"
          description="Этот раздел доступен только продавцам. Откройте магазин на странице «Стать продавцом»."
        />
      </main>
    );
  }

  return (
    <main className="container py-10">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-[28px] border border-border bg-card p-3 shadow-card">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </main>
  );
}
