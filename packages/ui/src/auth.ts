import { authAdapter, roleService, withTransaction } from '@yoga-sof/core/server';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: authAdapter,
  providers: [Google],
  trustHost: true,
  events: {
    createUser: async ({ user }) => {
      const email = user.email?.toLowerCase();

      if (email && adminEmails().includes(email)) {
        await withTransaction((tx) =>
          roleService.grantUserRole({ userId: user.id!, role: 'administrator' }, tx),
        );
      }
    },
  },
});
