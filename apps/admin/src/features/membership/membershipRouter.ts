import { TRPCError } from '@trpc/server';
import {
  membershipCancelSchema,
  membershipCreateSchema,
  membershipEditSchema,
  membershipGetSchema,
  membershipListSchema,
  membershipService,
  withTransaction,
} from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, writeProcedure } from '../../server/trpc';

export const membershipRouter = trpc.router({
  list: readProcedure
    .input(membershipListSchema)
    .query(({ input }) =>
      withTransaction((tx) => membershipService.list(input, tx), { readOnly: true }),
    ),
  get: readProcedure
    .input(membershipGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => membershipService.get(input, tx), { readOnly: true }),
    ),
  create: writeProcedure
    .input(membershipCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipService.create(input, tx))),
  update: writeProcedure
    .input(membershipEditSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipService.update(input, tx))),
  cancel: writeProcedure.input(membershipCancelSchema).mutation(async ({ input }) => {
    const userId = (await auth())?.user?.id;

    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Non authentifié.' });
    }

    return withTransaction((tx) => membershipService.cancel(input, tx, userId));
  }),
});
