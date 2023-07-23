import { backofficeReadProcedure, backofficeWriteProcedure, router } from '../trpc';
import {
  otherPaymentCategoryCreateSchema,
  otherPaymentCategoryFindSchema, otherPaymentCategoryUpdateSchema
} from '../../../common/schemas/otherPaymentCategory';
import {
  createOtherPaymentCategory, deleteOtherPaymentCategory,
  findOtherPaymentCategories,
  findOtherPaymentCategory, updateOtherPaymentCategory
} from '../../services/otherPaymentCategory';

export const otherPaymentCategoryRouter = router({
  find: backofficeReadProcedure
    .input(otherPaymentCategoryFindSchema)
    .query(async ({ input: { id } }) => findOtherPaymentCategory({ where: { id } })),
  findAll: backofficeReadProcedure
  .query(async () => findOtherPaymentCategories()),
  create: backofficeWriteProcedure
  .input(otherPaymentCategoryCreateSchema)
  .mutation(async ({ input }) => createOtherPaymentCategory({ data: input })),
  update: backofficeWriteProcedure
  .input(otherPaymentCategoryUpdateSchema)
  .mutation(async ({ input: { id, ...data } }) => updateOtherPaymentCategory({ where: { id }, data })),
  delete: backofficeWriteProcedure
  .input(otherPaymentCategoryFindSchema)
  .mutation(async ({ input: { id } }) => await deleteOtherPaymentCategory({ where: { id } })),
});
