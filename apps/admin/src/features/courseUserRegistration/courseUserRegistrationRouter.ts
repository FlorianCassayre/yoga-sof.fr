import {
  courseUserRegistrationCreateSchema,
  courseUserRegistrationEventListSchema,
  courseUserRegistrationListSchema,
  courseUserRegistrationService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { adminProcedure } from '../../server/trpc';

export const courseUserRegistrationRouter = trpc.router({
  list: adminProcedure
    .input(courseUserRegistrationListSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseUserRegistrationService.list(input, tx), { readOnly: true }),
    ),
  listEvents: adminProcedure.input(courseUserRegistrationEventListSchema).query(({ input }) =>
    withTransaction((tx) => courseUserRegistrationService.listEvents(input, tx), {
      readOnly: true,
    }),
  ),
  create: adminProcedure
    .input(courseUserRegistrationCreateSchema)
    .mutation(({ input }) =>
      withTransaction((tx) => courseUserRegistrationService.create(input, tx)),
    ),
});
