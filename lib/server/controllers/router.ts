import * as trpc from '@trpc/server';
import { createSessionRouter } from './middlewares/createSessionRouter';
import { courseRouter } from './routers/course';
import { createProtectedRouter } from './middlewares/createProtectedRouter';
import { UserType } from '../../common/all';
import { Context } from './context';
import { courseModelRouter } from './routers/courseModel';

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
