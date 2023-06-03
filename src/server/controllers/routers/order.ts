import { adminProcedure, router } from '../trpc';
import { orderCreateSchema, orderFindSchema, orderUpdateSchema } from '../../../common/schemas/order';
import {
  createOrder,
  createOrderAutomatically,
  deleteOrder, findItemsWithNoOrder,
  findOrder,
  findOrders,
  updateOrder
} from '../../services/order';
import { z } from 'zod';
import { prisma, readTransaction, writeTransaction } from '../../prisma';

export const orderModelRouter = router({
  find: adminProcedure
    .input(orderFindSchema)
    .query(async ({ input: { id } }) => {
      return readTransaction(prisma => findOrder(prisma, { where: { id } }));
    }),
  findUpdate: adminProcedure
    .input(orderFindSchema)
    .query<z.infer<typeof orderUpdateSchema>>(async ({ input: { id } }) =>
      prisma.order.findUniqueOrThrow({ where: { id }, select: { id: true, date: true, notes: true } })
    ),
  findAll: adminProcedure
    .input(z.strictObject({ userId: z.number().int().min(0).optional() }))
    .query(async ({ input: { userId } }) => findOrders({ where: { userId, includeDisabled: false } })),
  findAllItemsWithNoOrder: adminProcedure
    .input(z.strictObject({ userId: z.number().int().min(0).optional() }))
    .query(async ({ input: { userId } }) => findItemsWithNoOrder({ where: { userId } })),
  create: adminProcedure
    .input(orderCreateSchema)
    .mutation(async ({ input }) => {
      const [result, callback] = await writeTransaction(prisma => createOrder(prisma, { data: input }));
      await callback();
      return result;
    }),
  update: adminProcedure
    .input(orderUpdateSchema)
    .mutation(async ({ input: { id, ...data } }) => updateOrder({ where: { id }, data })),
  delete: adminProcedure
    .input(orderFindSchema)
    .mutation(async ({ input: { id } }) => deleteOrder({ where: { id } })),
  createAutomatically: adminProcedure
    .input(z.strictObject({
      courseRegistrationId: z.number().int().min(0),
    }))
    .mutation(async ({ input: { courseRegistrationId } }) => createOrderAutomatically({ where: { courseRegistrationId } })),
});
