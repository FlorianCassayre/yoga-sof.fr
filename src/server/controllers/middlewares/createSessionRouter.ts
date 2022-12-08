import { getSession } from 'next-auth/react';
import { middleware } from '../trpc';

export const sessionMiddleware = middleware(async ({ next, ctx: { req } }) => {
  const session = await getSession({ req });
  return next({
    ctx: {
      session,
    },
  });
});
