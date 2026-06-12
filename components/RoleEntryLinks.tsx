import Link from 'next/link';
import { Store, Wrench } from 'lucide-react';
import { appHref } from '@/lib/appUrls';

/**
 * Ролевые кнопки-ссылки для панели входа/регистрации.
 * Каждая ведёт на страницу регистрации соответствующего приложения (свой домен),
 * где создаётся аккаунт с нужной ролью и сразу открывается кабинет.
 */
export function RoleEntryLinks() {
  return (
    <div className="mt-6 border-t border-border pt-6">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Войти как
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={appHref('seller', '/register')}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-4 py-4 text-center transition hover:border-primary hover:bg-card"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-foreground">Продавец</span>
          <span className="text-[11px] text-muted-foreground">Открыть магазин</span>
        </Link>
        <Link
          href={appHref('master', '/register')}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-4 py-4 text-center transition hover:border-primary hover:bg-card"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Wrench className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-foreground">Мастер</span>
          <span className="text-[11px] text-muted-foreground">Стать мастером</span>
        </Link>
      </div>
    </div>
  );
}
