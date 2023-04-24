import { initTRPC, MiddlewareBuilder } from '@trpc/server';
import { Context } from './context';
import { UserType } from '../../common/all';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { ServiceError } from '../services/helpers/errors';
import { getSession } from 'next-auth/react';
import * as trpc from '@trpc/server';
import { TRPC_ERROR_CODES_BY_KEY } from '@trpc/server/rpc';
import { Session } from 'next-auth';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    if (error.cause instanceof ZodError) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: error.cause.flatten(),
        },
      };
    } else if (error.cause instanceof ServiceError) {
      return {
        code: TRPC_ERROR_CODES_BY_KEY.BAD_REQUEST,
        message: error.cause.message,
        data: {
          code: error.cause.code,
        },
      };
    } else {
      return { code: shape.code, message: 'Une erreur est survenue', data: {} };
    }
  },
});

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;

const createSessionMiddleware = middleware(async ({ next, ctx: { req } }) => {
  const session = await getSession({ req });
  return next({
    ctx: {
      session,
    },
  });
});

const createSessionProtectedMiddleware = (allowedUserTypes: UserType[]) => {
  return middleware(async ({ next, ctx: { req } }) => {
    const session = await getSession({ req });
    if (session === null) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    if (!allowedUserTypes.includes(session.userType)) {
      throw new trpc.TRPCError({ code: 'FORBIDDEN' });
    }
    return next<{ session: Session }>({
      ctx: {
        session,
      },
    });
  });
};

export const sessionUnprotectedProcedure = procedure.use(createSessionMiddleware);
const createSessionProtectedProcedure =
  (allowedUserTypes: UserType[]) => procedure.use(createSessionProtectedMiddleware(allowedUserTypes));
export const adminProcedure = createSessionProtectedProcedure([UserType.Admin]);
export const userProcedure = createSessionProtectedProcedure([UserType.Admin, UserType.Regular]);
