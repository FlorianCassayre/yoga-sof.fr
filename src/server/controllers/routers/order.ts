import { adminProcedure, router } from '../trpc';
import { orderCreateSchema, orderFindSchema } from '../../../common/schemas/order';
import { createOrder, findOrder, findOrders } from '../../services/order';

export const orderModelRouter = router({
  find: adminProcedure
    .input(orderFindSchema)
    .query(async ({ input: { id } }) => {
      return findOrder({ where: { id } });
    }),
  findAll: adminProcedure
    .query(async () => findOrders({ where: { includeDisabled: false } })),
  create: adminProcedure
    .input(orderCreateSchema)
    .mutation(async ({ input }) => createOrder({ data: input })),
});
