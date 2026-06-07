'use client';

import Link from 'next/link';
import { Flame, Sparkles } from 'lucide-react';
import { Service } from '@prisma/client';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`} className="card group overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/15 text-primary">
        <Flame className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.description}</p>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <span>от {service.priceFrom} сом</span>
        {service.isUrgentAvailable ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-primary">
            <Sparkles className="h-4 w-4" /> Срочно
          </span>
        ) : null}
      </div>
    </Link>
  );
}
