'use client';

import Link from 'next/link';
import { MapPin, Shield, Star } from 'lucide-react';
import { Master } from '@prisma/client';

interface MasterCardProps {
  master: Master;
}

export function MasterCard({ master }: MasterCardProps) {
  return (
    <Link href={`/masters/${master.id}`} className="card overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-600">
          <img src={master.avatarUrl} alt={master.name} className="h-full w-full rounded-3xl object-cover" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{master.name}</h3>
          <p className="text-sm text-slate-600">{master.specialization}</p>
        </div>
      </div>
      <div className="grid gap-3 text-sm text-slate-600">
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
