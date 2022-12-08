import { TRPCError, initTRPC } from '@trpc/server';
import { Context } from './context';
import { sessionMiddleware } from './middlewares/createSessionRouter';

const t = initTRPC.context<Context & Record<string, unknown>>().create();

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;

export const sessionUnprotectedProcedure = t.procedure.use(sessionMiddleware); // TODO
export const sessionProtectedProcedure = sessionUnprotectedProcedure.use(); // TODO
