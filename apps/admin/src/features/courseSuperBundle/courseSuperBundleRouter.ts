import {
  courseSuperBundleCreateSchema,
  courseSuperBundleEditSchema,
  courseSuperBundleGetSchema,
  courseSuperBundleListSchema,
  courseSuperBundleService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, writeProcedure } from '../../server/trpc';

export const courseSuperBundleRouter = trpc.router({
  list: readProcedure
    .input(courseSuperBundleListSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseSuperBundleService.list(input, tx), { readOnly: true }),
    ),
  get: readProcedure
    .input(courseSuperBundleGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseSuperBundleService.get(input, tx), { readOnly: true }),
    ),
  create: writeProcedure
    .input(courseSuperBundleCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => courseSuperBundleService.create(input, tx))),
  update: writeProcedure
    .input(courseSuperBundleEditSchema)
    .mutation(({ input }) => withTransaction((tx) => courseSuperBundleService.update(input, tx))),
});
