import { adminProcedure, router } from '../trpc';
import {
  transactionCreateSchema,
  transactionFindSchema,
  transactionUpdateSchema
} from '../../../common/schemas/transaction';
import {
  createTransaction,
  deleteTransaction,
  findTransaction,
  findTransactions,
  updateTransaction
} from '../../services/transaction';
import { z } from 'zod';

export const transactionRouter = router({
  find: adminProcedure
    .input(transactionFindSchema)
    .query(async ({ input: { id } }) => findTransaction({ where: { id } })),
  findAll: adminProcedure
    .input(z.object({
      userId: z.number().int().min(0).optional(),
    }))
    .query(async ({ input: { userId } }) => findTransactions({ where: { userId } })),
  create: adminProcedure
    .input(transactionCreateSchema)
    .mutation(async ({ input }) => createTransaction({ data: input })),
  update: adminProcedure
    .input(transactionUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateTransaction({ where: { id }, data })),
  delete: adminProcedure
    .input(transactionFindSchema)
    .mutation(async ({ input: { id } }) => deleteTransaction({ where: { id } })),
});
