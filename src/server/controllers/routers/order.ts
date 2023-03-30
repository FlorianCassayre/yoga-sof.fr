import { adminProcedure, router } from '../trpc';
import { orderCreateSchema, orderFindSchema } from '../../../common/schemas/order';
import { createOrder, deleteOrder, findOrder, findOrders, previewCreateOrder } from '../../services/order';
import { z } from 'zod';

export const orderModelRouter = router({
  find: adminProcedure
    .input(orderFindSchema)
    .query(async ({ input: { id } }) => {
      return findOrder({ where: { id } });
    }),
  findAll: adminProcedure
    .input(z.strictObject({ userId: z.number().int().min(0).optional() }))
    .query(async ({ input: { userId } }) => findOrders({ where: { userId, includeDisabled: false } })),
  previewCreate: adminProcedure
    .input(orderCreateSchema)
    .query(async ({ input }) => previewCreateOrder({ data: input })),
  create: adminProcedure
    .input(orderCreateSchema)
    .mutation(async ({ input }) => createOrder({ data: input })),
  delete: adminProcedure
    .input(orderFindSchema)
    .mutation(async ({ input: { id } }) => deleteOrder({ where: { id } }))
});
