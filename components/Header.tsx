'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogIn, LogOut, ShoppingCart, Store, User, Wrench, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { appHref } from '@/lib/appUrls';

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/services', label: 'Услуги' },
  { href: '/shop', label: 'Магазин' },
  { href: '/masters', label: 'Мастера' },
  { href: '/orders', label: 'Заказы' }
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const isMaster = session?.user?.role === 'MASTER';
  const isSeller = session?.user?.role === 'SELLER';
  const isPlainUser = session?.user?.role === 'USER';

  // The master cabinet renders its own full-screen mobile shell.
  if (pathname?.startsWith('/master')) return null;

  // On mobile the homepage has its own gradient hero header, so hide the global one there.
  const isHome = pathname === '/';

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl ${isHome ? 'max-sm:hidden' : ''}`}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Wrench className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">TajFix</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? 'bg-card text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell variant="header" />
          <Link
            href="/cart"
            aria-label="Корзина"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>

          {status === 'loading' ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-secondary" />
          ) : session ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Link
                  href={appHref('admin', '/admin')}
                  className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4" /> Админ
                </Link>
              ) : null}
              {isMaster ? (
                <Link
                  href={appHref('master', '/master')}
                  className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:inline-flex"
                >
                  <Wrench className="h-4 w-4" /> Кабинет
                </Link>
              ) : null}
              {isSeller ? (
                <Link
                  href={appHref('seller', '/seller')}
                  className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:inline-flex"
                >
                  <Store className="h-4 w-4" /> Магазин
                </Link>
              ) : null}
              {isPlainUser ? (
                <Link
                  href={appHref('seller', '/seller/register')}
                  className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:inline-flex"
                >
                  <Store className="h-4 w-4" /> Стать продавцом
                </Link>
              ) : null}
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <User className="h-4 w-4" />
                <span className="hidden max-w-[120px] truncate sm:inline">{session.user?.name ?? 'Профиль'}</span>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                aria-label="Выйти"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <LogIn className="h-4 w-4" /> Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
