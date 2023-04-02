import { adminProcedure, router } from '../trpc';
import { orderCreateSchema, orderFindSchema } from '../../../common/schemas/order';
import { createOrder, createOrderAutomatically, deleteOrder, findOrder, findOrders } from '../../services/order';
import { z } from 'zod';
import { writeTransaction } from '../../prisma';

export const orderModelRouter = router({
  find: adminProcedure
    .input(orderFindSchema)
    .query(async ({ input: { id } }) => {
      return findOrder({ where: { id } });
    }),
  findAll: adminProcedure
    .input(z.strictObject({ userId: z.number().int().min(0).optional() }))
    .query(async ({ input: { userId } }) => findOrders({ where: { userId, includeDisabled: false } })),
  create: adminProcedure
    .input(orderCreateSchema)
    .mutation(async ({ input }) => writeTransaction(prisma => createOrder(prisma, { data: input }))),
  delete: adminProcedure
    .input(orderFindSchema)
    .mutation(async ({ input: { id } }) => deleteOrder({ where: { id } })),
  createAutomatically: adminProcedure
    .input(z.strictObject({
      courseRegistrationId: z.number().int().min(0),
    }))
    .mutation(async ({ input: { courseRegistrationId } }) => createOrderAutomatically({ where: { courseRegistrationId } })),
});
