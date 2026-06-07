import './globals.css';
import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a'
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TajFix — Ремонт техники и магазин электроники в Душанбе',
    template: '%s — TajFix'
  },
  description:
    'TajFix — вызов мастера для ремонта бытовой техники и магазин электроники в Душанбе. Холодильники, стиральные машины, кондиционеры, телевизоры. Оплата при получении.',
  keywords: [
    'ремонт техники Душанбе',
    'ремонт холодильников',
    'ремонт стиральных машин',
    'мастер на дом',
    'магазин электроники Таджикистан',
    'TajFix'
  ],
  applicationName: 'TajFix',
  authors: [{ name: 'TajFix' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName: 'TajFix',
    title: 'TajFix — Ремонт техники и магазин электроники в Душанбе',
    description:
      'Вызов мастера для ремонта бытовой техники и магазин электроники в Душанбе. Оплата при получении.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TajFix — Ремонт техники и магазин электроники',
    description: 'Вызов мастера и магазин электроники в Душанбе. Оплата при получении.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
