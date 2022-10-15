import NextAuth from 'next-auth';
import { UserType } from '../lib/common/all';

declare module "next-auth" {
  interface Session {
    userId: number,
    userType: UserType,
    displayName: string | null | undefined,
    displayEmail: string | null | undefined,
    publicAccessToken: string,
  }
  // import('@prisma/client').Prisma.User
  interface User {
    id: number;

    customEmail?: string;
    customName?: string;
    publicAccessToken: string;
    receiveEmails: boolean;
    createdAt: number;
    lastActivity: number;
    disabled: boolean;
  }
}
