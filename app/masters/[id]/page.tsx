import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Shield, Star } from 'lucide-react';

interface Params {
  params: {
    id: string;
  };
}

export default async function MasterDetailPage({ params }: Params) {
  const master = await prisma.master.findUnique({ where: { id: params.id } });
  if (!master) notFound();

  return (
    <main className="container py-10">
      <div className="mb-6 flex items-center gap-3 text-slate-600">
        <Link href="/masters" className="inline-flex items-center gap-2 text-sm hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Назад к мастерам
        </Link>
      </div>
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl bg-slate-50 p-8 text-center">
            <img src={master.avatarUrl} alt={master.name} className="mx-auto h-56 w-56 rounded-3xl object-cover" />
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{master.specialization}</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">{master.name}</h1>
              <p className="mt-4 text-slate-600">{master.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Рейтинг</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{master.rating.toFixed(1)}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Отзывы</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{master.reviewsCount}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-3xl bg-slate-100 p-5">
                <Shield className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm text-slate-500">Гарантия</p>
                  <p className="text-slate-900">{master.guaranteeText}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl bg-slate-100 p-5">
                <Phone className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm text-slate-500">Телефон</p>
                  <p className="text-slate-900">{master.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/book?masterId=${master.id}`} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Забронировать мастера
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
