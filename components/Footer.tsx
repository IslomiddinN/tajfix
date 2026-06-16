'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wrench } from 'lucide-react';

const columns = [
  {
    title: 'Сервис',
    links: [
      { href: '/services', label: 'Услуги ремонта' },
      { href: '/shop', label: 'Магазин техники' },
      { href: '/masters', label: 'Мастера' },
      { href: '/ai', label: 'AI-помощник' },
      { href: '/support', label: 'Чат поддержки' }
    ]
  },
  {
    title: 'Компания',
    links: [
      { href: '/careers', label: 'Работа и сотрудничество' },
      { href: '/contacts', label: 'Как нас найти' },
      { href: '/privacy', label: 'Конфиденциальность' }
    ]
  }
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/master')) return null;

  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
            </span>
            <span className="text-lg tracking-tight">TajFix</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Ремонт бытовой техники и магазин электроники в Душанбе. Быстро, с гарантией, оплата наличными.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-foreground">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition hover:text-foreground">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-sm font-semibold text-foreground">Контакты</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="tel:+992000000000" className="hover:text-foreground">+992 000 00 00 00</a></li>
            <li><a href="mailto:hello@tajfix.pro" className="hover:text-foreground">hello@tajfix.pro</a></li>
            <li>г. Душанбе, пр. Рудаки, 25</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5">
        <p className="container text-center text-xs text-muted-foreground">© {new Date().getFullYear()} TajFix. Все права защищены.</p>
      </div>
    </footer>
  );
}
