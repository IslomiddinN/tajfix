// Base URLs for each app in the monorepo. Within one app, navigation stays
// relative (plain paths). To link ACROSS apps (e.g. the client header linking
// to the admin panel or the seller cabinet), build an absolute URL with
// appHref() so the browser crosses to the right domain/port.
//
// In production, set these in the root .env to the real domains:
//   NEXT_PUBLIC_CLIENT_URL=https://tajfix.tj
//   NEXT_PUBLIC_MASTER_URL=https://master.tajfix.tj
//   NEXT_PUBLIC_SELLER_URL=https://seller.tajfix.tj
//   NEXT_PUBLIC_ADMIN_URL=https://admin.tajfix.tj
// In dev they default to the per-app localhost ports.
export type AppName = 'client' | 'master' | 'seller' | 'admin';

export const APP_URLS: Record<AppName, string> = {
  client: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
  master: process.env.NEXT_PUBLIC_MASTER_URL || 'http://localhost:3001',
  seller: process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3002',
  admin: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003'
};

export function appHref(app: AppName, path = ''): string {
  return `${APP_URLS[app]}${path}`;
}
