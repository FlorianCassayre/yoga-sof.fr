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
  couponRouter, membershipModelRouter
} from './routers';
import { router } from './trpc';
import { transactionRouter } from './routers/transaction';
import { membershipRouter } from './routers/membership';

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
    transaction: transactionRouter,
    couponModel: couponModelRouter,
    coupon: couponRouter,
    membershipModel: membershipModelRouter,
    membership: membershipRouter,
  });

export type AppRouter = typeof appRouter;
