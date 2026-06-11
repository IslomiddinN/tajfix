import { DefaultSession } from 'next-auth';

type AppRole = 'USER' | 'ADMIN' | 'MASTER' | 'SELLER';

declare module 'next-auth' {
  interface User {
    id: string;
    role: AppRole;
  }

  interface Session {
    user: {
      id: string;
      role: AppRole;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: AppRole;
  }
}
