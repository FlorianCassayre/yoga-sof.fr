import {
  courseCreateSchema,
  courseEditSchema,
  courseGetSchema,
  courseListSchema,
  courseService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { adminProcedure } from '../../server/trpc';

export const courseRouter = trpc.router({
  list: adminProcedure
    .input(courseListSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseService.list(input, tx), { readOnly: true }),
    ),
  get: adminProcedure
    .input(courseGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseService.get(input, tx), { readOnly: true }),
    ),
  create: adminProcedure
    .input(courseCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => courseService.create(input, tx))),
  update: adminProcedure
    .input(courseEditSchema)
    .mutation(({ input }) => withTransaction((tx) => courseService.update(input, tx))),
});
