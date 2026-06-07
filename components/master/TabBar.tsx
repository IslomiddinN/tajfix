'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MASTER_TABS } from './navItems';

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-border bg-card/90 backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-5 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
        {MASTER_TABS.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                href={t.to}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'scale-110' : ''} transition`} />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
