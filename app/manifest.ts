import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TajFix — Ремонт техники и магазин',
    short_name: 'TajFix',
    description: 'Ремонт бытовой техники и магазин электроники в Душанбе. Уведомления о заказах, заявках и поддержке.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'ru',
    dir: 'ltr',
    background_color: '#f4f6fb',
    theme_color: '#0EA5E9',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
}
