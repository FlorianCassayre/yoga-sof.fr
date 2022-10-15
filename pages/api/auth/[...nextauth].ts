/* eslint-disable no-param-reassign */

import NextAuth, { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// import FacebookProvider from 'next-auth/providers/facebook';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { USER_TYPE_ADMIN, USER_TYPE_REGULAR } from '../../../lib/common';
import { NODEMAILER_CONFIGURATION, prisma, sendVerificationRequest } from '../../../lib/server';

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  adapter: PrismaAdapter(prisma),
  // https://next-auth.js.org/configuration/providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    // Facebook is disabled temporarily until the app is reactivated
    /* FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }), */
    EmailProvider({
      server: NODEMAILER_CONFIGURATION,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: sendVerificationRequest as any,
    }),
  ],
  // This option is not strictly required since next-auth will look for the variable `NEXTAUTH_SECRET` anyway
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    // jwt: true, // FIXME
    // maxAge: 30 * 24 * 60 * 60, // 30 days
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // JSON Web tokens are only used for sessions if the `jwt: true` session
  // option is set - or by default if no database is specified.
  // https://next-auth.js.org/configuration/options#jwt
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    // encryption: true,
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
  },
  pages: {
    signIn: '/connexion',
    // signOut: '/auth/signout', // Displays form with sign out button
    error: '/connexion',
    verifyRequest: '/verification',
    // newUser: null // If set, new users will be directed here on first sign in
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) { // eslint-disable-line no-unused-vars
      if (account.providerAccountId !== null) { // Can be null in case of email
        await prisma.account.updateMany({
          where: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
          data: {
            updatedAt: new Date().toISOString(), // Force set current timestamp
          },
        });
      }

      const isAllowedToSignIn = !user.disabled;
      if (isAllowedToSignIn) {
        return true;
      }
      // Return false to display a default error message
      return false;
      // Or you can return a URL to redirect to:
      // return '/unauthorized'
    },
    // async redirect(url, baseUrl) { return baseUrl },
    async session({ session, user }) {
      // `session` is the shared object between the client and the server (client can read it but only the server can modify it)
      // `user` exactly corresponds to the data stored in the database under the model `User`

      const isAllowedToSignIn = !user.disabled;
      if (!isAllowedToSignIn) {
        throw new Error(); // Shouldn't happen?
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastActivity: new Date().toISOString(),
        },
      });

      const isEmailAdminWhitelisted = !!(await prisma.adminWhitelist.count({
        where: {
          // This email must have necessarily come from one of the registered providers,
          // and cannot be changed manually. Thus it should be safe to trust.
          email: user.email ?? undefined,
        },
      }));

      // We extend the `session` object to contain information about the permissions of the user
      session.userId = user.id;
      session.userType = isEmailAdminWhitelisted ? USER_TYPE_ADMIN : USER_TYPE_REGULAR;
      session.displayName = user.customName ? user.customName : user.name;
      session.displayEmail = user.customEmail ? user.customEmail : user.email;
      session.publicAccessToken = user.publicAccessToken;

      return session;
    },
  },
  events: {},
  debug: false,
});
