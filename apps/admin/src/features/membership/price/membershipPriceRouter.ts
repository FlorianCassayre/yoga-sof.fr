import {
  membershipPriceCreateSchema,
  membershipPriceDeleteSchema,
  membershipPriceEditSchema,
  membershipPriceGetSchema,
  membershipPriceListSchema,
  membershipPriceService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { adminProcedure } from '../../../server/trpc';

export const membershipPriceRouter = trpc.router({
  list: adminProcedure
    .input(membershipPriceListSchema)
    .query(({ input }) =>
      withTransaction((tx) => membershipPriceService.list(input, tx), { readOnly: true }),
    ),
  get: adminProcedure
    .input(membershipPriceGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => membershipPriceService.get(input, tx), { readOnly: true }),
    ),
  create: adminProcedure
    .input(membershipPriceCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipPriceService.create(input, tx))),
  update: adminProcedure
    .input(membershipPriceEditSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipPriceService.update(input, tx))),
  delete: adminProcedure
    .input(membershipPriceDeleteSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipPriceService.delete(input, tx))),
});
