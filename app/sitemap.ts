import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Запрашивает БД, поэтому генерируем по запросу, а не на этапе сборки
// (сборка не должна требовать живую БД).
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/shop',
    '/services',
    '/masters',
    '/ai',
    '/contacts',
    '/careers',
    '/privacy'
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7
  }));

  try {
    const [products, services, masters] = await Promise.all([
      prisma.product.findMany({ select: { id: true, updatedAt: true } }),
      prisma.service.findMany({ select: { id: true, updatedAt: true } }),
      prisma.master.findMany({ select: { id: true, updatedAt: true } })
    ]);

    const dynamicRoutes: MetadataRoute.Sitemap = [
      ...products.map((p) => ({
        url: `${siteUrl}/shop/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6
      })),
      ...services.map((s) => ({
        url: `${siteUrl}/services/${s.id}`,
        lastModified: s.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6
      })),
      ...masters.map((m) => ({
        url: `${siteUrl}/masters/${m.id}`,
        lastModified: m.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.5
      }))
    ];

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    // БД недоступна — отдаём хотя бы статические маршруты.
    return staticRoutes;
  }
}
