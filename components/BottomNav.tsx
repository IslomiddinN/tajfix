'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, ShoppingBag, ClipboardList, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40 rounded-3xl border border-white/60 bg-white/75 shadow-xl backdrop-blur-2xl sm:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <NavItem href="/" label="Главная" icon={Home} active={pathname === '/'} />
        <NavItem href="/services" label="Услуги" icon={Wrench} active={pathname === '/services'} />
        <NavItem href="/shop" label="Магазин" icon={ShoppingBag} active={pathname === '/shop'} />
        <NavItem href="/orders" label="Заказы" icon={ClipboardList} active={pathname === '/orders'} />
        <NavItem href="/profile" label="Профиль" icon={User} active={pathname === '/profile'} />
      </div>
    </nav>
  );
}

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 rounded-3xl px-3 py-2 text-xs font-medium transition ${
        active ? 'bg-brand text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}
