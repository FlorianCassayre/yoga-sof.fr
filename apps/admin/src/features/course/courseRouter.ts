import {
  courseBatchCreateSchema,
  courseCalendarListSchema,
  courseEditSchema,
  courseGetSchema,
  courseListSchema,
  courseService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, writeProcedure } from '../../server/trpc';

export const courseRouter = trpc.router({
  list: readProcedure
    .input(courseListSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseService.list(input, tx), { readOnly: true }),
    ),
  calendar: readProcedure
    .input(courseCalendarListSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseService.listCalendar(input, tx), { readOnly: true }),
    ),
  get: readProcedure
    .input(courseGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseService.get(input, tx), { readOnly: true }),
    ),
  suggestTemplates: readProcedure.query(() =>
    withTransaction((tx) => courseService.suggestTemplates(tx), { readOnly: true }),
  ),
  createBatch: writeProcedure
    .input(courseBatchCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => courseService.createBatch(input, tx))),
  update: writeProcedure
    .input(courseEditSchema)
    .mutation(({ input }) => withTransaction((tx) => courseService.update(input, tx))),
});
