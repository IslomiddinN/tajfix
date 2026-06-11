import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { MasterStoreProvider } from '@/lib/master/store';
import { Shell } from '@/components/master/Shell';
import { TabBar } from '@/components/master/TabBar';
import { appHref } from '@/lib/appUrls';

export const dynamic = 'force-dynamic';

export default async function MasterLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  // /login lives in this same app (master domain) — sessions are per-domain.
  if (!session?.user) redirect('/login?callbackUrl=/master');
  // A logged-in non-master belongs on the public site, not here.
  if (session.user.role !== 'MASTER') redirect(appHref('client', '/'));

  return (
    <MasterStoreProvider>
      <Shell>{children}</Shell>
      <TabBar />
    </MasterStoreProvider>
  );
}
