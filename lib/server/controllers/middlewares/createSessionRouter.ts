import * as trpc from '@trpc/server';
import { getSession } from 'next-auth/react';

export const createSessionRouter = () => {
  return trpc
    .router()
    .middleware(async ({ next }) => {
      const session = await getSession();
      return next({
        ctx: {
          session,
        },
      });
    });
};
