import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { ServiceCard } from '@/components/ServiceCard';
import { ProductCard } from '@/components/ProductCard';
import { MasterCard } from '@/components/MasterCard';
import { AIHelperCard } from '@/components/AIHelperCard';

export const dynamic = 'force-dynamic';

const categories = [
  { name: 'Стиральная машина', slug: 'washing-machine' },
  { name: 'Холодильник', slug: 'fridge' },
  { name: 'Плита и духовка', slug: 'oven' },
  { name: 'Кондиционер', slug: 'air-conditioner' },
  { name: 'Посудомоечная машина', slug: 'dishwasher' },
  { name: 'Телевизор', slug: 'tv' },
  { name: 'Мелкая техника', slug: 'small-appliances' }
];

export default async function HomePage() {
  const services = await prisma.service.findMany({ take: 4, orderBy: { createdAt: 'desc' } });
  const hits = await prisma.product.findMany({ where: { isHit: true }, take: 4, orderBy: { createdAt: 'desc' } });
  const masters = await prisma.master.findMany({ take: 4, orderBy: { rating: 'desc' } });

  return (
    <main className="pb-28">
      <section className="container pt-5 sm:pt-8">
        <div className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-border bg-card p-5 shadow-[0_35px_80px_-40px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:mb-10 sm:rounded-[2rem] sm:p-10">
          <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-brand/25 to-transparent blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1.5fr_auto] sm:gap-8">
            <div>
              <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur-xl sm:text-sm">
                Classic Blue
              </span>
              <h1 className="mt-4 max-w-2xl text-[1.7rem] font-semibold leading-tight tracking-tight text-foreground sm:mt-6 sm:text-5xl">
                Ремонт техники, покупка и помощь AI в одном месте
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground/90 sm:mt-4 sm:text-lg">
                Заказывайте мастера, выбирайте запчасти и получайте консультацию по поломкам прямо в приложении.
              </p>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-[1fr_auto]">
                <div className="flex items-center gap-3 rounded-full bg-secondary px-4 py-3 ring-1 ring-border backdrop-blur-xl">
                  <Search className="h-5 w-5 text-foreground/70" />
                  <input
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                    placeholder="Найдите услугу, товар или мастера"
                    aria-label="Поиск"
                  />
                </div>
                <Link href="/services" className="btn btn-primary w-full sm:w-auto">
                  Найти мастера
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground/80 sm:mt-8 sm:gap-3 sm:text-sm">
                <span className="rounded-full bg-secondary px-3 py-1.5 sm:py-2">Скорость 24/7</span>
                <span className="rounded-full bg-secondary px-3 py-1.5 sm:py-2">Гарантия на ремонт</span>
                <span className="rounded-full bg-secondary px-3 py-1.5 sm:py-2">Доставка по Душанбе</span>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
              <Link href="/services" className="card flex h-24 items-center justify-between gap-4 rounded-3xl bg-card px-5 py-4 text-foreground shadow-lg transition hover:bg-card sm:h-28 sm:py-5">
                <div>
                  <p className="text-sm opacity-90">Срочный ремонт</p>
                  <h2 className="mt-2 text-xl font-semibold">Найдем мастера быстро</h2>
                </div>
                <ArrowRight className="h-6 w-6" />
              </Link>
              <Link href="/shop" className="card flex h-24 items-center justify-between gap-4 rounded-3xl bg-card px-5 py-4 text-foreground shadow-lg transition hover:bg-card sm:h-28 sm:py-5">
                <div>
                  <p className="text-sm opacity-90">Магазин техники</p>
                  <h2 className="mt-2 text-xl font-semibold">Новинки и скидки</h2>
                </div>
                <ArrowRight className="h-6 w-6" />
              </Link>
              <Link href="/ai" className="card flex h-24 items-center justify-between gap-4 rounded-3xl bg-card px-5 py-4 text-foreground shadow-lg transition hover:bg-card sm:h-28 sm:py-5">
                <div>
                  <p className="text-sm opacity-90">AI-помощник</p>
                  <h2 className="mt-2 text-xl font-semibold">Подберет поломку и цену</h2>
                </div>
                <ArrowRight className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_300px]">
          <div className="card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="badge">BETA</span>
                <h2 className="mt-4 text-2xl font-semibold">TajFix AI</h2>
                <p className="mt-3 text-muted-foreground">Опишите поломку, а помощник подберет вероятную причину и примерную стоимость.</p>
                <p className="mt-4 text-foreground font-semibold">Стиралка стучит при отжиме — что делать?</p>
              </div>
              <Link href="/ai" className="mt-4 inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90">
                Спросить AI
              </Link>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold">Популярные категории</h3>
            <div className="mt-4 grid gap-3">
              {categories.map((category) => (
                <div key={category.slug} className="rounded-3xl border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  {category.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Услуги</h2>
              <p className="text-sm text-muted-foreground">Выберите ремонт по категории</p>
            </div>
            <Link href="/services" className="text-sm font-semibold text-primary">Все услуги</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Хиты магазина</h2>
              <p className="text-sm text-muted-foreground">Лучшие товары по доступной цене</p>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-primary">В магазин</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {hits.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Лучшие мастера поблизости</h2>
              <p className="text-sm text-muted-foreground">Проверенные специалисты в Душанбе</p>
            </div>
            <Link href="/masters" className="text-sm font-semibold text-primary">Все мастера</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {masters.map((master) => (
              <MasterCard key={master.id} master={master} />
            ))}
          </div>
        </section>

        <section className="mb-16 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <h3 className="font-semibold">Бесплатная диагностика</h3>
            <p className="text-sm text-muted-foreground">Проверка проблемы мастером без предоплаты.</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold">Доставка от 1000 сом</h3>
            <p className="text-sm text-muted-foreground">Удобная доставка техники по Душанбе.</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold">По Душанбе — за 24 часа</h3>
            <p className="text-sm text-muted-foreground">Быстрая подача мастера и доставка.</p>
          </div>
        </section>
      </section>
    </main>
  );
}
