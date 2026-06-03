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
      <div className="mb-6 flex items-center gap-3 text-slate-600">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Назад к услугам
        </Link>
      </div>
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="rounded-3xl bg-slate-50 p-8 text-center">
            <img src={service.imageUrl} alt={service.title} className="mx-auto h-48 w-full object-contain" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Услуга</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">{service.title}</h1>
            <p className="mt-4 text-slate-600">{service.description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Стоимость от</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{service.priceFrom} сом</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Срочный ремонт</p>
                <p className="mt-2 text-slate-950">{service.isUrgentAvailable ? 'Доступен 24/7' : 'По записи'}</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-3xl bg-slate-100 p-4">
                <Truck className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm text-slate-500">Доставка мастера</p>
                  <p className="text-sm text-slate-900">По Душанбе за 24 часа</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl bg-slate-100 p-4">
                <Timer className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm text-slate-500">Гарантия</p>
                  <p className="text-sm text-slate-900">30 дней на работу</p>
                </div>
              </div>
            </div>
            <Link href={`/book?serviceId=${service.id}`} className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Вызвать мастера
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
