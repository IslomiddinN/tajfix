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
    <main className="container py-6 sm:py-10">
      <div className="mb-5 flex items-center gap-3 text-muted-foreground sm:mb-6">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Назад к услугам
        </Link>
      </div>
      <section className="rounded-[24px] border border-border bg-card p-4 shadow-card sm:rounded-[32px] sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[320px_1fr] sm:gap-8">
          <div className="rounded-3xl bg-secondary p-5 text-center sm:p-8">
            <img src={service.imageUrl} alt={service.title} className="mx-auto h-40 w-full object-contain sm:h-48" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground sm:text-sm">Услуга</p>
            <h1 className="mt-3 text-2xl font-semibold text-foreground sm:mt-4 sm:text-3xl">{service.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">{service.description}</p>
            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
              <div className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">Стоимость от</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{service.priceFrom} сом</p>
              </div>
              <div className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">Срочный ремонт</p>
                <p className="mt-2 text-foreground">{service.isUrgentAvailable ? 'Доступен 24/7' : 'По записи'}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:mt-8 sm:grid-cols-2">
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
            <Link href={`/book?serviceId=${service.id}`} className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:mt-8">
              Вызвать мастера
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
