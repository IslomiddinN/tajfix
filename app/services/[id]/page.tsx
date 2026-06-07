import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Truck, Timer } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Params {
  params: {
    id: string;
  };
}

export default async function ServiceDetailPage({ params }: Params) {
  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) notFound();

  return (
    <main className="container py-10">
      <div className="mb-6 flex items-center gap-3 text-muted-foreground">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Назад к услугам
        </Link>
      </div>
      <section className="rounded-[32px] border border-border bg-card p-8 shadow-card">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="rounded-3xl bg-secondary p-8 text-center">
            <img src={service.imageUrl} alt={service.title} className="mx-auto h-48 w-full object-contain" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Услуга</p>
            <h1 className="mt-4 text-3xl font-semibold text-foreground">{service.title}</h1>
            <p className="mt-4 text-muted-foreground">{service.description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">Стоимость от</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{service.priceFrom} сом</p>
              </div>
              <div className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">Срочный ремонт</p>
                <p className="mt-2 text-foreground">{service.isUrgentAvailable ? 'Доступен 24/7' : 'По записи'}</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-3xl bg-secondary p-4">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Доставка мастера</p>
                  <p className="text-sm text-foreground">По Душанбе за 24 часа</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl bg-secondary p-4">
                <Timer className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Гарантия</p>
                  <p className="text-sm text-foreground">30 дней на работу</p>
                </div>
              </div>
            </div>
            <Link href={`/book?serviceId=${service.id}`} className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
              Вызвать мастера
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
