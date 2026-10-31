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

export const membershipPriceRouter = trpc.router({
  list: trpc.procedure
    .input(membershipPriceListSchema)
    .query(({ input }) =>
      withTransaction((tx) => membershipPriceService.list(input, tx), { readOnly: true }),
    ),
  get: trpc.procedure
    .input(membershipPriceGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => membershipPriceService.get(input, tx), { readOnly: true }),
    ),
  create: trpc.procedure
    .input(membershipPriceCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipPriceService.create(input, tx))),
  update: trpc.procedure
    .input(membershipPriceEditSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipPriceService.update(input, tx))),
  delete: trpc.procedure
    .input(membershipPriceDeleteSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipPriceService.delete(input, tx))),
});
