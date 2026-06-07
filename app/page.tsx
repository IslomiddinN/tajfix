import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Bell, ChevronRight, Shield, ShoppingBag, Sparkles, Star, Truck, Wrench, Zap } from 'lucide-react';
import { HomeSearch } from '@/components/HomeSearch';
import { ThemeToggle } from '@/components/ThemeToggle';

export const dynamic = 'force-dynamic';

const categories = [
  { name: 'Стиральная', slug: 'washing-machine', icon: '🧺' },
  { name: 'Холодильник', slug: 'fridge', icon: '❄️' },
  { name: 'Плита', slug: 'oven', icon: '🔥' },
  { name: 'Кондиционер', slug: 'air-conditioner', icon: '💨' },
  { name: 'Посудомойка', slug: 'dishwasher', icon: '🍽️' },
  { name: 'Телевизор', slug: 'tv', icon: '📺' },
  { name: 'Мелкая техника', slug: 'small-appliances', icon: '🔌' }
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(' ')[0];

  const [services, hits, masters] = await Promise.all([
    prisma.service.findMany({ take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ where: { isHit: true }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.master.findMany({ take: 8, orderBy: { rating: 'desc' } })
  ]);

  return (
    <main className="mx-auto w-full max-w-[480px] pb-28">
      {/* Gradient hero */}
      <section className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-primary to-blue-700 px-5 pb-16 pt-6 text-white">
        {/* Mobile-only top bar (desktop uses the global Header) */}
        <div className="mb-5 flex items-center justify-between sm:hidden">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/15">
              <Wrench className="h-5 w-5" />
            </span>
            TajFix
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25" />
            <Link href="/orders" className="relative grid h-10 w-10 place-items-center rounded-full bg-white/15 transition hover:bg-white/25">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-green-400" />
            </Link>
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Салом{firstName ? `, ${firstName}` : ''} 👋
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight">
          Дом, который
          <br />
          <span className="text-cyan-200">работает идеально</span>
        </h1>

        <HomeSearch />
      </section>

      {/* Quick tiles overlapping the hero */}
      <div className="relative z-10 -mt-10 grid grid-cols-2 gap-3 px-5">
        <Tile
          href="/services"
          icon={<Zap className="h-5 w-5" />}
          iconClass="bg-primary/10 text-primary"
          title="Срочный ремонт"
          sub="Приоритет 24/7"
        />
        <Tile
          href="/shop"
          icon={<ShoppingBag className="h-5 w-5" />}
          iconClass="bg-green-500/10 text-green-600"
          title="Магазин техники"
          sub="Рассрочка 0 %"
        />
      </div>

      {/* AI helper card */}
      <Link
        href="/ai"
        className="mx-5 mt-4 flex items-start gap-4 rounded-3xl bg-gradient-to-br from-primary to-teal-500 p-5 text-white"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/20">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-white/80">TajFix AI</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">BETA</span>
          </div>
          <p className="mt-1.5 text-base font-bold leading-snug">«Стиралка стучит при отжиме» — что делать?</p>
          <p className="mt-1 text-xs text-white/80">Спроси на тадж., рус. или English — подскажу причину и цену</p>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-white/80" />
      </Link>

      {/* Services / categories */}
      <Row title="Услуги мастеров" href="/services">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href="/services"
            className="flex w-[96px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center transition active:scale-95"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-2xl">{c.icon}</span>
            <span className="text-xs font-medium leading-tight text-foreground">{c.name}</span>
          </Link>
        ))}
      </Row>

      {/* Shop hits */}
      {hits.length > 0 && (
        <Row title="🔥 Хиты магазина" href="/shop">
          {hits.map((p) => (
            <Link key={p.id} href={`/shop/${p.id}`} className="w-[158px] shrink-0">
              <div className="relative h-[140px] overflow-hidden rounded-2xl bg-secondary">
                <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                {p.discountPercent ? (
                  <span className="absolute left-2 top-2 rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-destructive">
                    -{p.discountPercent}%
                  </span>
                ) : (
                  <span className="absolute left-2 top-2 rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-primary">
                    Хит
                  </span>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-tight text-foreground">{p.title}</p>
              <p className="mt-1 text-sm font-bold text-foreground">{p.price.toLocaleString('ru-RU')} сом</p>
            </Link>
          ))}
        </Row>
      )}

      {/* Masters nearby */}
      {masters.length > 0 && (
        <Row title="Лучшие мастера рядом" href="/masters">
          {masters.map((m) => (
            <Link
              key={m.id}
              href={`/masters/${m.id}`}
              className="w-[250px] shrink-0 rounded-3xl border border-border bg-card p-4 transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={m.avatarUrl} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
                  <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-green-500 text-white ring-2 ring-card">
                    <Shield className="h-3 w-3" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold leading-tight text-foreground">{m.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {m.rating.toFixed(1)} · {m.reviewsCount}
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{m.distanceKm.toFixed(1)} км от вас</span>
                <span className="font-semibold text-primary">от {m.priceFrom} сом</span>
              </div>
            </Link>
          ))}
        </Row>
      )}

      {/* Services list */}
      {services.length > 0 && (
        <Row title="Популярные услуги" href="/services">
          {services.map((s) => (
            <Link
              key={s.id}
              href={`/services/${s.id}`}
              className="flex w-[220px] shrink-0 flex-col rounded-3xl border border-border bg-card p-4 transition active:scale-[0.98]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Wrench className="h-5 w-5" />
              </span>
              <p className="mt-3 font-semibold leading-tight text-foreground">{s.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
              <p className="mt-3 text-sm font-bold text-primary">от {s.priceFrom} сом</p>
            </Link>
          ))}
        </Row>
      )}

      {/* Delivery promo */}
      <Link
        href="/shop"
        className="mx-5 mt-7 flex items-center gap-4 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20">
          <Truck className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Бесплатно</p>
          <p className="text-lg font-bold leading-tight">Доставка от 1000 сом</p>
          <p className="text-xs text-white/80">По Душанбе — за 24 часа</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-white/80" />
      </Link>
    </main>
  );
}

function Tile({
  href,
  icon,
  iconClass,
  title,
  sub
}: {
  href: string;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  sub: string;
}) {
  return (
    <Link href={href} className="rounded-3xl border border-border bg-card p-4 shadow-card transition active:scale-95">
      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${iconClass}`}>{icon}</span>
      <p className="mt-3 font-bold leading-tight text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </Link>
  );
}

function Row({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 px-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-primary">
          Все
        </Link>
      </div>
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">{children}</div>
    </section>
  );
}
