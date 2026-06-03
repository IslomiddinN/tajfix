import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/ProductDetail';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
