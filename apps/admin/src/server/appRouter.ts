import type { inferRouterOutputs } from '@trpc/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { calendarSettingRouter } from '../features/calendar/calendarSettingRouter';
import { courseRouter } from '../features/course/courseRouter';
import { courseUserRegistrationRouter } from '../features/courseUserRegistration/courseUserRegistrationRouter';
import { membershipRouter } from '../features/membership/membershipRouter';
import { membershipPriceRouter } from '../features/membership/price/membershipPriceRouter';
import { membershipSettingRouter } from '../features/membership/settings/membershipSettingRouter';
import { roleRouter } from '../features/role/roleRouter';
import { userRouter } from '../features/user/userRouter';

export const appRouter = trpc.router({
  calendarSetting: calendarSettingRouter,
  course: courseRouter,
  registration: courseUserRegistrationRouter,
  membership: membershipRouter,
  membershipPrice: membershipPriceRouter,
  membershipSetting: membershipSettingRouter,
  role: roleRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<typeof appRouter>;
