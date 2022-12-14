import * as trpc from '@trpc/server';
import { inferProcedureInput, inferProcedureOutput, ProcedureRecord } from '@trpc/server';
import {
  adminWhitelistRouter,
  courseModelRouter,
  courseRegistrationRouter,
  courseRouter,
  emailMessageRouter,
  userRouter
} from './routers';
import { UserType } from '../../common/all';
import { Context } from './context';
import { ZodError } from 'zod';
import { ServiceError } from '../services/helpers/errors';
import { selfRouter } from './routers/self';
import { publicRouter } from './routers/public';
import { mergeRouters, router } from './trpc';

export const appRouter =
  mergeRouters(
    adminWhitelistRouter,
    courseRouter,
    courseModelRouter,
    courseRegistrationRouter,
    emailMessageRouter,
    publicRouter,
    selfRouter,
    userRouter,
  );

export type AppRouter = typeof appRouter;

export type inferProcedures<TObj extends ProcedureRecord> = {
  [TPath in keyof TObj]: {
    input: inferProcedureInput<TObj[TPath]>;
    output: inferProcedureOutput<TObj[TPath]>;
  };
};

export type Mutations = inferProcedures<AppRouter["_def"]["mutations"]>;
export type MutationKey = keyof Mutations;

export type Queries = inferProcedures<AppRouter["_def"]["queries"]>;
export type QueryKey = keyof Queries;
