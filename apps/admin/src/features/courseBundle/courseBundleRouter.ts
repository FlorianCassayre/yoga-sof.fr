import {
  courseBundleCreateSchema,
  courseBundleEditSchema,
  courseBundleGetSchema,
  courseBundleListSchema,
  courseBundleService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, writeProcedure } from '../../server/trpc';

export const courseBundleRouter = trpc.router({
  list: readProcedure
    .input(courseBundleListSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseBundleService.list(input, tx), { readOnly: true }),
    ),
  get: readProcedure
    .input(courseBundleGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseBundleService.get(input, tx), { readOnly: true }),
    ),
  create: writeProcedure
    .input(courseBundleCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => courseBundleService.create(input, tx))),
  update: writeProcedure
    .input(courseBundleEditSchema)
    .mutation(({ input }) => withTransaction((tx) => courseBundleService.update(input, tx))),
});
