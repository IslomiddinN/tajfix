import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { MasterStoreProvider } from '@/lib/master/store';
import { Shell } from '@/components/master/Shell';
import { TabBar } from '@/components/master/TabBar';

export const dynamic = 'force-dynamic';

export default async function MasterLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/master');
  if (session.user.role !== 'MASTER') redirect('/');

  return (
    <MasterStoreProvider>
      <Shell>{children}</Shell>
      <TabBar />
    </MasterStoreProvider>
  );
}
