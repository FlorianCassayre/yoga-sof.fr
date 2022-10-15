import * as trpc from '@trpc/server';
import { createSessionRouter } from './middlewares/createSessionRouter';
import { courseRouter } from './routers/course';
import { createProtectedRouter } from './middlewares/createProtectedRouter';
import { UserType } from '../../common/all';

export const appRouter = trpc
  .router()
  .merge(
    createSessionRouter()
      .merge('course', createProtectedRouter([UserType.Admin]).merge(courseRouter)),
  );

export type AppRouter = typeof appRouter;
