import {
  createCouponModel, deleteCouponModel,
  findCouponModel,
  findCouponModels,
  updateCouponModel
} from '../../services';
import { backofficeReadProcedure, backofficeWriteProcedure, router } from '../trpc';
import { couponModelCreateSchema, couponModelFindSchema, couponModelUpdateSchema } from '../../../common/schemas/couponModel';

export const couponModelRouter = router({
  find: backofficeReadProcedure
    .input(couponModelFindSchema)
    .query(async ({ input: { id } }) => {
      return findCouponModel({ where: { id } });
    }),
  findAll: backofficeReadProcedure
    .query(async () => findCouponModels()),
  create: backofficeWriteProcedure
    .input(couponModelCreateSchema)
    .mutation(async ({ input }) => createCouponModel({ data: input })),
  update: backofficeWriteProcedure
    .input(couponModelUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateCouponModel({ where: { id }, data })),
  delete: backofficeWriteProcedure
    .input(couponModelFindSchema)
    .mutation(async ({ input: { id } }) => {
      await deleteCouponModel({ where: { id } });
    }),
});
