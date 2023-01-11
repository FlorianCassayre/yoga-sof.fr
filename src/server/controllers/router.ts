import {
  adminWhitelistRouter,
  courseModelRouter,
  courseRegistrationRouter,
  courseRouter,
  emailMessageRouter,
  userRouter,
  selfRouter,
  publicRouter,
  couponModelRouter,
  couponRouter,
} from './routers';
import { router } from './trpc';

export const appRouter =
  router({
    adminWhitelist: adminWhitelistRouter,
    course: courseRouter,
    courseModel: courseModelRouter,
    courseRegistration: courseRegistrationRouter,
    emailMessage: emailMessageRouter,
    public: publicRouter,
    self: selfRouter,
    user: userRouter,
    couponModel: couponModelRouter,
    coupon: couponRouter,
  });

export type AppRouter = typeof appRouter;
