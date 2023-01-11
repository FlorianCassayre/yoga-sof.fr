import {
  createCouponModel, deleteCouponModel,
  findCouponModel,
  findCouponModels,
  updateCouponModel
} from '../../services';
import { adminProcedure, router } from '../trpc';
import { couponModelCreateSchema, couponModelFindSchema, couponModelUpdateSchema } from '../../../common/schemas/couponModel';

export const couponModelRouter = router({
  find: adminProcedure
    .input(couponModelFindSchema)
    .query(async ({ input: { id } }) => {
      return findCouponModel({ where: { id } });
    }),
  findAll: adminProcedure
    .query(async () => findCouponModels()),
  create: adminProcedure
    .input(couponModelCreateSchema)
    .mutation(async ({ input }) => createCouponModel({ data: input })),
  update: adminProcedure
    .input(couponModelUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateCouponModel({ where: { id }, data })),
  delete: adminProcedure
    .input(couponModelFindSchema)
    .mutation(async ({ input: { id } }) => {
      await deleteCouponModel({ where: { id } });
    }),
});
