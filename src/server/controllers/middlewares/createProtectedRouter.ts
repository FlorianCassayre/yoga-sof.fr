import * as trpc from '@trpc/server';
import { UserType } from '../../../common/all';
import { sessionMiddleware } from './createSessionRouter';

export const createSessionProtectedMiddleware = (allowedUserTypes: UserType[]) => {
  return sessionMiddleware.apply(async ({ next, ctx: { session } }) => {
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
