'use client';

import Link from 'next/link';
import { Flame, Sparkles } from 'lucide-react';
import { Service } from '@prisma/client';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`} className="card group overflow-hidden p-4 transition hover:-translate-y-1 hover:shadow-xl sm:p-5">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-3xl bg-primary/15 text-primary sm:mb-4 sm:h-12 sm:w-12">
        <Flame className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground sm:text-lg">{service.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground sm:mt-2 sm:line-clamp-none">{service.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground sm:mt-6">
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
