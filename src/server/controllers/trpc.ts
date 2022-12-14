import { initTRPC } from '@trpc/server';
import { Context } from './context';
import { sessionMiddleware } from './middlewares/createSessionRouter';
import { UserType } from '../../common/all';
import { createSessionProtectedMiddleware } from './middlewares/createProtectedRouter';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { ServiceError } from '../services/helpers/errors';

const t = initTRPC.context<Context & Record<string, unknown>>().create({
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
        code: -32600, // FIXME issue with compiler
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

export const sessionUnprotectedProcedure = procedure.use(sessionMiddleware);
const createSessionProtectedProcedure =
  (allowedUserTypes: UserType[]) => procedure.use(createSessionProtectedMiddleware(allowedUserTypes));
export const adminProcedure = createSessionProtectedProcedure([UserType.Admin]);
export const userProcedure = createSessionProtectedProcedure([UserType.Admin, UserType.Regular]);
