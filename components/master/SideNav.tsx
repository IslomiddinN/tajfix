'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Bell, LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { MASTER_TABS } from './navItems';
import { ThemeToggle } from '@/components/ThemeToggle';

export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 p-5 lg:flex">
      <Link href="/master" className="px-1">
        <Logo />
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {MASTER_TABS.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              href={t.to}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1">
        <Link
          href="/master/notifications"
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
            pathname === '/master/notifications' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <Bell className="h-5 w-5" /> Уведомления
        </Link>
        <ThemeToggle
          showLabel
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        />
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" /> Выйти
        </button>
      </div>
    </aside>
  );
}
