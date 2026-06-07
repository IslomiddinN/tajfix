'use client';

import Link from 'next/link';
import { MapPin, Shield, Star } from 'lucide-react';
import { Master } from '@prisma/client';

interface MasterCardProps {
  master: Master;
}

export function MasterCard({ master }: MasterCardProps) {
  return (
    <Link href={`/masters/${master.id}`} className="card overflow-hidden p-4 transition hover:-translate-y-1 hover:shadow-xl sm:p-5">
      <div className="mb-3 flex items-center gap-3 sm:mb-4 sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-secondary text-muted-foreground sm:h-14 sm:w-14">
          <img src={master.avatarUrl} alt={master.name} className="h-full w-full rounded-3xl object-cover" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground sm:text-lg">{master.name}</h3>
          <p className="text-sm text-muted-foreground">{master.specialization}</p>
        </div>
      </div>
      <div className="grid gap-2.5 text-sm text-muted-foreground sm:gap-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" /> {master.rating.toFixed(1)} · {master.reviewsCount} отзывов
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> {master.distanceKm.toFixed(1)} км
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" /> от {master.priceFrom} сом
        </div>
      </div>
    </Link>
  );
}
