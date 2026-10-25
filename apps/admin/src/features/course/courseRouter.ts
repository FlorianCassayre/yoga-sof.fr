import { TRPCError } from '@trpc/server';
import {
  courseCreateSchema,
  courseEditSchema,
  courseGetSchema,
  courseListSchema,
  courseService,
} from '@yoga-sof/core/server';

import { trpc } from '../../server/trpc';

export const courseRouter = trpc.router({
  list: trpc.procedure.input(courseListSchema).query(({ input }) => courseService.list(input)),
  get: trpc.procedure.input(courseGetSchema).query(({ input }) => courseService.get(input)),
  create: trpc.procedure.input(courseCreateSchema).mutation(async ({ input }) => {
    const row = await courseService.create(input);

    if (row === null) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Création impossible.' });
    }

    return row;
  }),
  update: trpc.procedure.input(courseEditSchema).mutation(async ({ input }) => {
    const row = await courseService.update(input);

    if (row === null) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'La séance a été modifiée entre-temps.',
      });
    }

    return row;
  }),
});
