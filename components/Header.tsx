'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogIn, LogOut, ShoppingCart, User, Wrench, LayoutDashboard } from 'lucide-react';

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

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand text-white shadow-md shadow-brand/20">
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
                  active ? 'bg-white/90 text-brand shadow-sm shadow-slate-200/30' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label="Корзина"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>

          {status === 'loading' ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-slate-100" />
          ) : session ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4" /> Админ
                </Link>
              ) : null}
              {isMaster ? (
                <Link
                  href="/master"
                  className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
                >
                  <Wrench className="h-4 w-4" /> Кабинет
                </Link>
              ) : null}
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <User className="h-4 w-4" />
                <span className="hidden max-w-[120px] truncate sm:inline">{session.user?.name ?? 'Профиль'}</span>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                aria-label="Выйти"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              <LogIn className="h-4 w-4" /> Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
