import * as trpc from '@trpc/server';
import { inferProcedureInput, inferProcedureOutput, ProcedureRecord } from '@trpc/server';
import { createSessionRouter } from './middlewares/createSessionRouter';
import { courseRouter } from './routers/course';
import { createProtectedRouter } from './middlewares/createProtectedRouter';
import { UserType } from '../../common/all';
import { Context } from './context';
import { courseModelRouter } from './routers/courseModel';
import { adminWhitelistRouter } from './routers/adminWhitelist';
import { userRouter } from './routers/user';
import { emailMessageRouter } from './routers/emailMessage';
import { courseRegistrationRouter } from './routers';

export const appRouter = trpc
  .router<Context>()
  .merge(
    createSessionRouter()
      .merge('course.', createProtectedRouter([UserType.Admin]).merge(courseRouter)),
  )
  .merge(
    createSessionRouter()
      .merge('courseModel.', createProtectedRouter([UserType.Admin]).merge(courseModelRouter))
  )
  .merge(
    createSessionRouter()
      .merge('adminWhitelist.', createProtectedRouter([UserType.Admin]).merge(adminWhitelistRouter))
  )
  .merge(
    createSessionRouter()
      .merge('user.', createProtectedRouter([UserType.Admin]).merge(userRouter))
  )
  .merge(
    createSessionRouter()
      .merge('emailMessage.', createProtectedRouter([UserType.Admin]).merge(emailMessageRouter))
  )
  .merge(
    createSessionRouter()
      .merge('courseRegistration.', createProtectedRouter([UserType.Admin]).merge(courseRegistrationRouter))
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
