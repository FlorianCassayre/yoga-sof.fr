import { authAdapter } from '@yoga-sof/core/server';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: authAdapter,
  providers: [Google],
  trustHost: true,
});
