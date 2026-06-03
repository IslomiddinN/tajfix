import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

/**
 * Returns the admin session, or null if the caller is not an authenticated ADMIN.
 * Mirror of the inline RBAC pattern used across the API routes.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return null;
  }
  return session;
}
