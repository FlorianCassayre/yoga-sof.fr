import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { USER_TYPE_ADMIN, USER_TYPE_REGULAR } from '../../../lib/common';
import { prisma } from '../../../lib/server';

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  // https://next-auth.js.org/configuration/providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
  ],
  secret: process.env.SECRET,
  session: {
    jwt: true,
    // maxAge: 30 * 24 * 60 * 60, // 30 days
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // JSON Web tokens are only used for sessions if the `jwt: true` session
  // option is set - or by default if no database is specified.
  // https://next-auth.js.org/configuration/options#jwt
  jwt: {
    // A secret to use for key generation (you should set this explicitly)
    // secret: 'INp8IvdIyeMcoGAgFGoA61DdBglwwSqnXJZkgz8PSnw',
    // Set to true to use encryption (default: false)
    // encryption: true,
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
  },
  pages: {
    signIn: '/connexion',
    // signOut: '/auth/signout', // Displays form with sign out button
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = true; // TODO
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    // async redirect(url, baseUrl) { return baseUrl },
    async session({ session, user, token }) {
      const email = session.user.email;

      session.user.provider = token.provider;
      session.user.id_provider = token.id_provider;

      const { id, user: { public_access_token, user_linked_accounts: linkedAccounts } } = await prisma.user_linked_account.upsert({
        where: {
          id_provider_provider: {
            id_provider: token.id_provider,
            provider: token.provider,
          },
        },
        update: {
          email: email,
          name: session.user.name,
          // We don't update the user's data
        },
        create: {
          id_provider: token.id_provider,
          email: email,
          provider: token.provider,
          name: session.user.name,
          user: {
            create: { // Nested create
              email: email,
              name: session.user.name,
            },
          },
        },
        select: {
          id: true,
          user: {
            select: {
              public_access_token: true,
              user_linked_accounts: {
                select: {
                  email: true,
                },
              },
            },
          },
        }
      });

      const userVerifiedEmails = linkedAccounts.map(({ email }) => email).filter(email => email);
      const whiteListedEmails = (await prisma.admins.findMany( // Not atomic, but doesn't matter
        {
          select: {
            email: true,
          },
        }
      )).map(({ email }) => email);
      const isAdmin = whiteListedEmails.some(email => userVerifiedEmails.includes(email));

      session.userType = isAdmin ? USER_TYPE_ADMIN : USER_TYPE_REGULAR;

      session.user.db_id = id;
      session.user.public_access_token = public_access_token;

      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user && account) {
        token = { provider: account.provider, id_provider: user.id, ...token };
      }
      return token;
    },
  },
  events: {},
  debug: false,
});
