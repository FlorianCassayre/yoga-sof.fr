import * as trpc from '@trpc/server';
import { ContextUnprotected } from '../context';
import { UserType } from '../../../common/all';

export const createProtectedRouter = (allowedUserTypes: UserType[]) => {
  return trpc
    .router<ContextUnprotected>()
    .middleware(async ({ ctx: { session }, next }) => {
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
