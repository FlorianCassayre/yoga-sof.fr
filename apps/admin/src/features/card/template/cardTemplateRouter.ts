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

import { readProcedure, settingsProcedure } from '../../../server/trpc';

export const cardTemplateRouter = trpc.router({
  list: readProcedure
    .input(cardTemplateListSchema)
    .query(({ input }) =>
      withTransaction((tx) => cardTemplateService.list(input, tx), { readOnly: true }),
    ),
  get: readProcedure
    .input(cardTemplateGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => cardTemplateService.get(input, tx), { readOnly: true }),
    ),
  create: settingsProcedure
    .input(cardTemplateCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => cardTemplateService.create(input, tx))),
  update: settingsProcedure
    .input(cardTemplateEditSchema)
    .mutation(({ input }) => withTransaction((tx) => cardTemplateService.update(input, tx))),
  delete: settingsProcedure
    .input(cardTemplateDeleteSchema)
    .mutation(({ input }) => withTransaction((tx) => cardTemplateService.delete(input, tx))),
});
