import {
  courseCreateSchema,
  courseEditSchema,
  courseGetSchema,
  courseListSchema,
  courseService,
  withTransaction,
} from '@yoga-sof/core/server';

import { trpc } from '../../server/trpc';

export const courseRouter = trpc.router({
  list: trpc.procedure
    .input(courseListSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseService.list(input, tx), { readOnly: true }),
    ),
  get: trpc.procedure
    .input(courseGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseService.get(input, tx), { readOnly: true }),
    ),
  create: trpc.procedure
    .input(courseCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => courseService.create(input, tx))),
  update: trpc.procedure
    .input(courseEditSchema)
    .mutation(({ input }) => withTransaction((tx) => courseService.update(input, tx))),
});
