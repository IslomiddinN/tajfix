'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BarChart3, Boxes, ClipboardList, Headset, User, Users, Wrench } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

const links = [
  { href: '/admin', label: 'Обзор', icon: BarChart3 },
  { href: '/admin/products', label: 'Товары', icon: Boxes },
  { href: '/admin/services', label: 'Услуги', icon: Wrench },
  { href: '/admin/masters', label: 'Мастера', icon: Users },
  { href: '/admin/orders', label: 'Заказы', icon: ClipboardList },
  { href: '/admin/support', label: 'Поддержка', icon: Headset },
  { href: '/admin/profile', label: 'Профиль', icon: User }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <main className="container py-10">
        <LoadingSpinner />
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="container flex flex-col items-center gap-5 py-10">
        <EmptyState title="Требуется вход" description="Войдите в админ-панель, чтобы продолжить." />
        <Link
          href="/login?callbackUrl=/admin"
          className="rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Войти
        </Link>
        <p className="text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/register" className="font-semibold text-primary">
            Зарегистрироваться
          </Link>
        </p>
      </main>
    );
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <main className="container py-10">
        <EmptyState title="Нет доступа" description="Этот раздел доступен только администратору." />
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
