import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { ServiceCard } from '@/components/ServiceCard';
import { ProductCard } from '@/components/ProductCard';
import { MasterCard } from '@/components/MasterCard';
import { AIHelperCard } from '@/components/AIHelperCard';
import { BottomNav } from '@/components/BottomNav';

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
      <section className="container pt-8">
        <div className="mb-10 relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/20 p-8 shadow-[0_35px_80px_-40px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:p-10">
          <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-brand/25 to-transparent blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.5fr_auto]">
            <div>
              <span className="inline-flex rounded-full bg-white/25 px-3 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-900/80 backdrop-blur-xl">
                Classic Blue
              </span>
              <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Ремонт техники, покупка и помощь AI в одном месте
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-700/90 sm:text-lg">
                Заказывайте мастера, выбирайте запчасти и получайте консультацию по поломкам прямо в приложении.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="flex items-center gap-3 rounded-full bg-white/60 px-4 py-3 ring-1 ring-white/50 backdrop-blur-xl">
                  <Search className="h-5 w-5 text-slate-950/70" />
                  <input
                    className="w-full bg-transparent text-slate-950 placeholder:text-slate-600 outline-none"
                    placeholder="Найдите услугу, товар или мастера"
                    aria-label="Поиск"
                  />
                </div>
                <Link href="/services" className="btn btn-primary w-full sm:w-auto">
                  Найти мастера
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-700/80">
                <span className="rounded-full bg-white/50 px-3 py-2">Скорость 24/7</span>
                <span className="rounded-full bg-white/50 px-3 py-2">Гарантия на ремонт</span>
                <span className="rounded-full bg-white/50 px-3 py-2">Доставка по Душанбе</span>
              </div>
            </div>

            <div className="grid gap-4">
              <Link href="/services" className="card flex h-28 items-center justify-between gap-4 rounded-3xl bg-white/70 px-5 py-5 text-slate-950 shadow-lg transition hover:bg-white/80">
                <div>
                  <p className="text-sm opacity-90">Срочный ремонт</p>
                  <h2 className="mt-2 text-xl font-semibold">Найдем мастера быстро</h2>
                </div>
                <ArrowRight className="h-6 w-6" />
              </Link>
              <Link href="/shop" className="card flex h-28 items-center justify-between gap-4 rounded-3xl bg-white/70 px-5 py-5 text-slate-950 shadow-lg transition hover:bg-white/80">
                <div>
                  <p className="text-sm opacity-90">Магазин техники</p>
                  <h2 className="mt-2 text-xl font-semibold">Новинки и скидки</h2>
                </div>
                <ArrowRight className="h-6 w-6" />
              </Link>
              <Link href="/ai" className="card flex h-28 items-center justify-between gap-4 rounded-3xl bg-white/70 px-5 py-5 text-slate-950 shadow-lg transition hover:bg-white/80">
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
                <p className="mt-3 text-slate-600">Опишите поломку, а помощник подберет вероятную причину и примерную стоимость.</p>
                <p className="mt-4 text-slate-900 font-semibold">Стиралка стучит при отжиме — что делать?</p>
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
                <div key={category.slug} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
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
              <p className="text-sm text-slate-500">Выберите ремонт по категории</p>
            </div>
            <Link href="/services" className="text-sm font-semibold text-sky-600">Все услуги</Link>
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
              <p className="text-sm text-slate-500">Лучшие товары по доступной цене</p>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-sky-600">В магазин</Link>
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
              <p className="text-sm text-slate-500">Проверенные специалисты в Душанбе</p>
            </div>
            <Link href="/masters" className="text-sm font-semibold text-sky-600">Все мастера</Link>
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
            <p className="text-sm text-slate-500">Проверка проблемы мастером без предоплаты.</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold">Доставка от 1000 сом</h3>
            <p className="text-sm text-slate-500">Удобная доставка техники по Душанбе.</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold">По Душанбе — за 24 часа</h3>
            <p className="text-sm text-slate-500">Быстрая подача мастера и доставка.</p>
          </div>
        </section>
      </section>
      <BottomNav />
    </main>
  );
}
