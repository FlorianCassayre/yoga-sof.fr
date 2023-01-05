import { inferProcedureInput, inferProcedureOutput, ProcedureRecord } from '@trpc/server';
import {
  adminWhitelistRouter,
  courseModelRouter,
  courseRegistrationRouter,
  courseRouter,
  emailMessageRouter,
  userRouter
} from './routers';
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

export type inferQueryOutput<
  TRouteKey extends keyof AppRouter['_def']['queries'],
  > = inferProcedureOutput<AppRouter['_def']['queries'][TRouteKey]>;
export type inferQueryInput<
  TRouteKey extends keyof AppRouter['_def']['queries'],
  > = inferProcedureInput<AppRouter['_def']['queries'][TRouteKey]>;
export type inferMutationOutput<
  TRouteKey extends keyof AppRouter['_def']['mutations'],
  > = inferProcedureOutput<AppRouter['_def']['mutations'][TRouteKey]>;
export type inferMutationInput<
  TRouteKey extends keyof AppRouter['_def']['mutations'],
  > = inferProcedureInput<AppRouter['_def']['mutations'][TRouteKey]>;

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
