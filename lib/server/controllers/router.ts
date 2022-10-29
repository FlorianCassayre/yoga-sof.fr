import * as trpc from '@trpc/server';
import { createSessionRouter } from './middlewares/createSessionRouter';
import { courseRouter } from './routers/course';
import { createProtectedRouter } from './middlewares/createProtectedRouter';
import { UserType } from '../../common/all';
import { Context } from './context';
import { courseModelRouter } from './routers/courseModel';
import { inferProcedureInput, inferProcedureOutput, ProcedureRecord } from '@trpc/server';

export const appRouter = trpc
  .router<Context>()
  .merge(
    createSessionRouter()
      .merge('course.', createProtectedRouter([UserType.Admin]).merge(courseRouter)),
  )
  .merge(
    createSessionRouter()
      .merge('courseModel.', createProtectedRouter([UserType.Admin]).merge(courseModelRouter))
  );

export type AppRouter = typeof appRouter;

type inferProcedures<TObj extends ProcedureRecord> = {
  [TPath in keyof TObj]: {
    input: inferProcedureInput<TObj[TPath]>;
    output: inferProcedureOutput<TObj[TPath]>;
  };
};

export type Mutations = inferProcedures<AppRouter["_def"]["mutations"]>;
export type MutationKey = keyof Mutations;

export type Queries = inferProcedures<AppRouter["_def"]["queries"]>;
export type QueryKey = keyof Queries;
