import {
  membershipCreateSchema,
  membershipListSchema,
  membershipService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { adminProcedure } from '../../server/trpc';

export const membershipRouter = trpc.router({
  list: adminProcedure
    .input(membershipListSchema)
    .query(({ input }) =>
      withTransaction((tx) => membershipService.list(input, tx), { readOnly: true }),
    ),
  create: adminProcedure
    .input(membershipCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipService.create(input, tx))),
});
