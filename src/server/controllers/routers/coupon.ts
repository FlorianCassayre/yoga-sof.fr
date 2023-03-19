import { adminProcedure, router } from '../trpc';
import { createCoupon, disableCoupon, findCoupon, findCoupons } from '../../services/coupon';
import { couponCreateSchema, couponFindSchema } from '../../../common/schemas/coupon';
import { z } from 'zod';

export const couponRouter = router({
  find: adminProcedure
    .input(couponFindSchema)
    .query(async ({ input: { id } }) => {
      return findCoupon({ where: { id } });
    }),
  findAll: adminProcedure
    .input(z.object({ includeDisabled: z.boolean().optional() }))
    .query(async ({ input: { includeDisabled } }) => findCoupons({ where: { includeDisabled: !!includeDisabled } })),
  create: adminProcedure
    .input(couponCreateSchema)
    .mutation(async ({ input: { couponModelId, userId }, ctx: { session } }) =>
      createCoupon({ data: { couponModelId, userId: userId ?? session.userId, free: userId == null } })
    ),
  disable: adminProcedure
    .input(couponFindSchema)
    .mutation(async ({ input: { id } }) => disableCoupon({ where: { id } })),
});
