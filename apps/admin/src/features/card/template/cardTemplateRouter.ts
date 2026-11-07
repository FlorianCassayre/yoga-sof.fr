import {
  cardTemplateCreateSchema,
  cardTemplateDeleteSchema,
  cardTemplateEditSchema,
  cardTemplateGetSchema,
  cardTemplateListSchema,
  cardTemplateService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { adminProcedure } from '../../../server/trpc';

export const cardTemplateRouter = trpc.router({
  list: adminProcedure
    .input(cardTemplateListSchema)
    .query(({ input }) =>
      withTransaction((tx) => cardTemplateService.list(input, tx), { readOnly: true }),
    ),
  get: adminProcedure
    .input(cardTemplateGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => cardTemplateService.get(input, tx), { readOnly: true }),
    ),
  create: adminProcedure
    .input(cardTemplateCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => cardTemplateService.create(input, tx))),
  update: adminProcedure
    .input(cardTemplateEditSchema)
    .mutation(({ input }) => withTransaction((tx) => cardTemplateService.update(input, tx))),
  delete: adminProcedure
    .input(cardTemplateDeleteSchema)
    .mutation(({ input }) => withTransaction((tx) => cardTemplateService.delete(input, tx))),
});
