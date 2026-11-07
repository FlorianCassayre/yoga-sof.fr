import { TRPCError } from '@trpc/server';
import {
  cardCancelSchema,
  cardCreateSchema,
  cardEditSchema,
  cardGetSchema,
  cardListSchema,
  cardService,
  withTransaction,
} from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { trpc } from '@yoga-sof/ui/trpc';

import { adminProcedure } from '../../server/trpc';

export const cardRouter = trpc.router({
  list: adminProcedure
    .input(cardListSchema)
    .query(({ input }) => withTransaction((tx) => cardService.list(input, tx), { readOnly: true })),
  get: adminProcedure
    .input(cardGetSchema)
    .query(({ input }) => withTransaction((tx) => cardService.get(input, tx), { readOnly: true })),
  create: adminProcedure
    .input(cardCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => cardService.create(input, tx))),
  update: adminProcedure
    .input(cardEditSchema)
    .mutation(({ input }) => withTransaction((tx) => cardService.update(input, tx))),
  cancel: adminProcedure.input(cardCancelSchema).mutation(async ({ input }) => {
    const userId = (await auth())?.user?.id;

    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Non authentifié.' });
    }

    return withTransaction((tx) => cardService.cancel(input, tx, userId));
  }),
});
