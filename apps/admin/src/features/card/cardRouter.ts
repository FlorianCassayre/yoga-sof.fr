import {
  cardCancelSchema,
  cardCreateSchema,
  cardEditSchema,
  cardGetSchema,
  cardListSchema,
  cardService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, writeProcedure } from '../../server/trpc';

export const cardRouter = trpc.router({
  list: readProcedure
    .input(cardListSchema)
    .query(({ input }) => withTransaction((tx) => cardService.list(input, tx), { readOnly: true })),
  get: readProcedure
    .input(cardGetSchema)
    .query(({ input }) => withTransaction((tx) => cardService.get(input, tx), { readOnly: true })),
  create: writeProcedure
    .input(cardCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => cardService.create(input, tx))),
  update: writeProcedure
    .input(cardEditSchema)
    .mutation(({ input }) => withTransaction((tx) => cardService.update(input, tx))),
  cancel: writeProcedure
    .input(cardCancelSchema)
    .mutation(({ ctx, input }) =>
      withTransaction((tx) => cardService.cancel(input, tx, ctx.userId)),
    ),
});
