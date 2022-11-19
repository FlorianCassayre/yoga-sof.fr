import * as trpc from '@trpc/server';
import { inferProcedureInput, inferProcedureOutput, ProcedureRecord } from '@trpc/server';
import { createSessionRouter } from './middlewares/createSessionRouter';
import {
  adminWhitelistRouter,
  courseModelRouter,
  courseRegistrationRouter,
  courseRouter,
  emailMessageRouter,
  userRouter
} from './routers';
import { createProtectedRouter } from './middlewares/createProtectedRouter';
import { UserType } from '../../common/all';
import { Context } from './context';
import { ZodError } from 'zod';
import { ServiceError } from '../services/helpers/errors';
import { selfRouter } from './routers/self';

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
  )
  .merge(
    createSessionRouter()
      .merge('self.', createProtectedRouter([UserType.Regular, UserType.Admin]).merge(selfRouter))
  )
  .formatError(({ shape, error }) => {
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
  });

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
