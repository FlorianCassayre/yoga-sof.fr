import * as trpc from '@trpc/server';
import { UserType } from '../../../common/all';
import { middleware } from '../trpc';
import { getSession } from 'next-auth/react';

export const createSessionProtectedMiddleware = (allowedUserTypes: UserType[]) => {
  return middleware(async ({ next, ctx: { req } }) => {
    const session = await getSession({ req });
    if (session === null) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    if (!allowedUserTypes.includes(session.userType)) {
      throw new trpc.TRPCError({ code: 'FORBIDDEN' });
    }
    return next({
      ctx: {
        session,
      },
    });
  });
};
