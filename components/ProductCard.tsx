'use client';

import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { Product } from '@prisma/client';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/${product.id}`} className="card overflow-hidden p-4 transition hover:-translate-y-1 hover:shadow-xl sm:p-5">
      <div className="mb-3 h-36 rounded-[22px] bg-secondary p-3 text-muted-foreground sm:mb-4 sm:h-44 sm:rounded-[26px] sm:p-4">
        <img src={product.imageUrl} alt={product.title} className="h-full w-full object-contain" />
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">{product.brand}</p>
          {product.discountPercent ? (
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">-{product.discountPercent}%</span>
          ) : null}
        </div>
        <h3 className="mt-2 text-base font-semibold text-foreground sm:mt-3 sm:text-lg">{product.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground sm:mt-2 sm:line-clamp-none">{product.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-foreground sm:mt-5">
        <div>
          <p className="text-lg font-semibold sm:text-xl">{product.price} сом</p>
          {product.oldPrice ? <p className="text-sm text-muted-foreground line-through">{product.oldPrice} сом</p> : null}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 text-amber-500" /> {product.rating.toFixed(1)}
        </div>
      </div>
    </Link>
  );
}
