import { adminProcedure, router } from '../trpc';
import { createCoupon, disableCoupon, findCoupon, findCoupons } from '../../services/coupon';
import { couponCreateSchema, couponFindSchema } from '../../../common/schemas/coupon';
import { z } from 'zod';
import { writeTransaction } from '../../prisma';

export const couponRouter = router({
  find: adminProcedure
    .input(couponFindSchema)
    .query(async ({ input: { id } }) => {
      return findCoupon({ where: { id } });
    }),
  findAll: adminProcedure
    .input(z.object({
      includeDisabled: z.boolean().optional(),
      userId: z.number().int().min(0).optional(),
      noOrder: z.boolean().optional(),
      notEmpty: z.boolean().optional(),
    }))
    .query(async ({ input: { includeDisabled, userId, noOrder, notEmpty } }) => {
      const result = await findCoupons({ where: { includeDisabled: !!includeDisabled, userId, noOrder } });
      if (notEmpty) {
        return result.filter(coupon => coupon.orderCourseRegistrations.length < coupon.quantity);
      } else {
        return result;
      }
    }),
  create: adminProcedure
    .input(couponCreateSchema)
    .mutation(async ({ input: { couponModelId, userId }, ctx: { session } }) =>
      writeTransaction(prisma => createCoupon(prisma, { data: { couponModelId, userId: userId ?? session.userId, free: userId == null } }))
    ),
  disable: adminProcedure
    .input(couponFindSchema)
    .mutation(async ({ input: { id } }) => disableCoupon({ where: { id } })),
});
