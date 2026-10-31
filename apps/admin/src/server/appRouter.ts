import type { inferRouterOutputs } from '@trpc/server';

import { courseRouter } from '../features/course/courseRouter';
import { courseUserRegistrationRouter } from '../features/courseUserRegistration/courseUserRegistrationRouter';
import { userRouter } from '../features/user/userRouter';
import { trpc } from './trpc';

export const appRouter = trpc.router({
  course: courseRouter,
  registration: courseUserRegistrationRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<typeof appRouter>;
