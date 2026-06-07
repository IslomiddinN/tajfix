'use client';

import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { Product } from '@prisma/client';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/${product.id}`} className="card overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 h-44 rounded-[26px] bg-secondary p-4 text-muted-foreground">
        <img src={product.imageUrl} alt={product.title} className="h-full w-full object-contain" />
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{product.brand}</p>
          {product.discountPercent ? (
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">-{product.discountPercent}%</span>
          ) : null}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-foreground">{product.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{product.description}</p>
      </div>
      <div className="mt-5 flex items-center justify-between text-foreground">
        <div>
          <p className="text-xl font-semibold">{product.price} сом</p>
          {product.oldPrice ? <p className="text-sm text-muted-foreground line-through">{product.oldPrice} сом</p> : null}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 text-amber-500" /> {product.rating.toFixed(1)}
        </div>
      </div>
    </Link>
  );
}
