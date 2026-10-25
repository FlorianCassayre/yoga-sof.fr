import type { inferRouterOutputs } from '@trpc/server';

import { courseRouter } from '../features/course/courseRouter';
import { trpc } from './trpc';

export const appRouter = trpc.router({
  course: courseRouter,
});

export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<typeof appRouter>;
