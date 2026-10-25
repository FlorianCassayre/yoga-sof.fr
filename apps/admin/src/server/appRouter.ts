import type { inferRouterOutputs } from '@trpc/server';

import { courseRouter } from '../features/course/courseRouter';
import { userRouter } from '../features/user/userRouter';
import { trpc } from './trpc';

export const appRouter = trpc.router({
  course: courseRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<typeof appRouter>;
