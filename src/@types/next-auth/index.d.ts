import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    userId: number;
    role: UserRole;
    displayName: string | null | undefined;
    displayEmail: string | null | undefined;
    publicAccessToken: string;
  }
  // import('@prisma/client').Prisma.User
  interface User {
    id: number;

    role: UserRole;
    customEmail?: string;
    customName?: string;
    publicAccessToken: string;
    receiveEmails: boolean;
    createdAt: number;
    lastActivity: number;
    disabled: boolean;
  }
}
