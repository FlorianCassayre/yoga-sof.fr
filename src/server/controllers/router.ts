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
import { mergeRouters } from './trpc';

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
