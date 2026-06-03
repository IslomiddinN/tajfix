import './globals.css';
import { ReactNode } from 'react';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'TajFix — Ремонт и магазин техники',
  description: 'Платформа ремонта техники и магазина электроники в Душанбе.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
