import { adminProcedure, router } from '../trpc';
import { createCoupon, disableCoupon, findCoupon, findCoupons } from '../../services/coupon';
import { couponCreateSchema, couponFindSchema } from '../../../common/schemas/coupon';
import { z } from 'zod';
import { prisma, transactionOptions } from '../../prisma';

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
    }))
    .query(async ({ input: { includeDisabled, userId, noOrder } }) => findCoupons({ where: { includeDisabled: !!includeDisabled, userId, noOrder } })),
  create: adminProcedure
    .input(couponCreateSchema)
    .mutation(async ({ input: { couponModelId, userId }, ctx: { session } }) =>
      prisma.$transaction(prisma => createCoupon(prisma, { data: { couponModelId, userId: userId ?? session.userId, free: userId == null } }), transactionOptions)
    ),
  disable: adminProcedure
    .input(couponFindSchema)
    .mutation(async ({ input: { id } }) => disableCoupon({ where: { id } })),
});
