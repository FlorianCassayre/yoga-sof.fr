import { backofficeReadProcedure, backofficeWriteProcedure, router } from '../trpc';
import {
  otherPaymentCreateSchema,
  otherPaymentFindSchema, otherPaymentUpdateSchema
} from '../../../common/schemas/otherPayment';
import {
  createOtherPayment, deleteOtherPayment,
  findOtherPayment,
  findOtherPayments, findUpdateOtherPayment,
  updateOtherPayment
} from '../../services/otherPayment';

export const otherPaymentRouter = router({
  find: backofficeReadProcedure
    .input(otherPaymentFindSchema)
    .query(async ({ input: { id } }) => findOtherPayment({ where: { id } })),
  findUpdate: backofficeReadProcedure
    .input(otherPaymentFindSchema)
    .query(async ({ input: { id } }) => findUpdateOtherPayment({ where: { id } })),
  findAll: backofficeReadProcedure
    .query(async () => findOtherPayments()),
  create: backofficeWriteProcedure
    .input(otherPaymentCreateSchema)
    .mutation(async ({ input }) => createOtherPayment({ data: input })),
  update: backofficeWriteProcedure
    .input(otherPaymentUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateOtherPayment({ where: { id }, data })),
  delete: backofficeWriteProcedure
    .input(otherPaymentFindSchema)
    .mutation(async ({ input: { id } }) => await deleteOtherPayment({ where: { id } })),
});
