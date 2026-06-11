import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

/**
 * Resolves the Seller profile for the current session, or null if the caller is
 * not an authenticated SELLER with a linked seller profile.
 * Mirrors the master.userId === session.user.id pattern used for the master cabinet.
 */
export async function getCurrentSeller() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'SELLER') {
    return null;
  }
  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  return seller;
}
