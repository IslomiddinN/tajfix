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
      <div className="mb-6 flex items-center gap-3 text-muted-foreground">
        <Link href="/masters" className="inline-flex items-center gap-2 text-sm hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Назад к мастерам
        </Link>
      </div>
      <section className="rounded-[32px] border border-border bg-card p-8 shadow-card">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl bg-secondary p-8 text-center">
            <img src={master.avatarUrl} alt={master.name} className="mx-auto h-56 w-56 rounded-3xl object-cover" />
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{master.specialization}</p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground">{master.name}</h1>
              <p className="mt-4 text-muted-foreground">{master.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">Рейтинг</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{master.rating.toFixed(1)}</p>
              </div>
              <div className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-muted-foreground">Отзывы</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{master.reviewsCount}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-3xl bg-secondary p-5">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Гарантия</p>
                  <p className="text-foreground">{master.guaranteeText}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl bg-secondary p-5">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Телефон</p>
                  <p className="text-foreground">{master.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/book?masterId=${master.id}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                Забронировать мастера
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
