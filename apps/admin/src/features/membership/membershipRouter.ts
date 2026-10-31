import {
  membershipCreateSchema,
  membershipListSchema,
  membershipService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

export const membershipRouter = trpc.router({
  list: trpc.procedure
    .input(membershipListSchema)
    .query(({ input }) =>
      withTransaction((tx) => membershipService.list(input, tx), { readOnly: true }),
    ),
  create: trpc.procedure
    .input(membershipCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipService.create(input, tx))),
});
