import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Закрываем приватные и служебные разделы от индексации.
      disallow: ['/admin', '/master', '/profile', '/cart', '/checkout', '/orders', '/api']
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
