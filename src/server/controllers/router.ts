import {
  courseModelRouter,
  courseRegistrationRouter,
  courseRouter,
  emailMessageRouter,
  userRouter,
  selfRouter,
  publicRouter,
  couponModelRouter,
  couponRouter, membershipModelRouter, pdfRouter
} from './routers';
import { router } from './trpc';
import { membershipRouter } from './routers/membership';
import { orderModelRouter } from './routers/order';
import { statisticsRouter } from './routers/statisticsRouter';
import { otherPaymentCategoryRouter } from './routers/otherPaymentCategory';
import { otherPaymentRouter } from './routers/otherPayment';

export const appRouter =
  router({
    course: courseRouter,
    courseModel: courseModelRouter,
    courseRegistration: courseRegistrationRouter,
    emailMessage: emailMessageRouter,
    public: publicRouter,
    self: selfRouter,
    user: userRouter,
    couponModel: couponModelRouter,
    coupon: couponRouter,
    membershipModel: membershipModelRouter,
    membership: membershipRouter,
    order: orderModelRouter,
    statistics: statisticsRouter,
    pdf: pdfRouter,
    otherPaymentCategory: otherPaymentCategoryRouter,
    otherPayment: otherPaymentRouter,
  });

export type AppRouter = typeof appRouter;
