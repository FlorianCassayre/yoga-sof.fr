import * as trpc from '@trpc/server';
import { getSession } from 'next-auth/react';

export const createSessionRouter = () => {
  return trpc
    .router<{ req: any }>()
    .middleware(async ({ next, ctx: { req } }) => {
      const session = await getSession({ req });
      return next({
        ctx: {
          session,
        },
      });
    });
};
