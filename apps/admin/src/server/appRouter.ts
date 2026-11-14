import type { inferRouterOutputs } from '@trpc/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { calendarSettingRouter } from '../features/calendar/calendarSettingRouter';
import { cardRouter } from '../features/card/cardRouter';
import { cardSettingRouter } from '../features/card/settings/cardSettingRouter';
import { cardTemplateRouter } from '../features/card/template/cardTemplateRouter';
import { courseRouter } from '../features/course/courseRouter';
import { courseBundleRouter } from '../features/courseBundle/courseBundleRouter';
import { courseUserWaitingListRouter } from '../features/courseUserWaitingList/courseUserWaitingListRouter';
import { emailRouter } from '../features/email/emailRouter';
import { membershipRouter } from '../features/membership/membershipRouter';
import { membershipPriceRouter } from '../features/membership/price/membershipPriceRouter';
import { membershipSettingRouter } from '../features/membership/settings/membershipSettingRouter';
import { notificationRouter } from '../features/notification/notificationRouter';
import { registrationRouter } from '../features/registration/registrationRouter';
import { roleRouter } from '../features/role/roleRouter';
import { userRouter } from '../features/user/userRouter';

export const appRouter = trpc.router({
  calendarSetting: calendarSettingRouter,
  card: cardRouter,
  cardSetting: cardSettingRouter,
  cardTemplate: cardTemplateRouter,
  course: courseRouter,
  courseBundle: courseBundleRouter,
  registration: registrationRouter,
  waitingList: courseUserWaitingListRouter,
  email: emailRouter,
  membership: membershipRouter,
  membershipPrice: membershipPriceRouter,
  membershipSetting: membershipSettingRouter,
  notification: notificationRouter,
  role: roleRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<typeof appRouter>;
