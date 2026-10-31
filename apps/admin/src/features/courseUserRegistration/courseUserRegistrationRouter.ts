import {
  courseUserRegistrationCreateSchema,
  courseUserRegistrationEventListSchema,
  courseUserRegistrationListSchema,
  courseUserRegistrationService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

export const courseUserRegistrationRouter = trpc.router({
  list: trpc.procedure
    .input(courseUserRegistrationListSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseUserRegistrationService.list(input, tx), { readOnly: true }),
    ),
  listEvents: trpc.procedure.input(courseUserRegistrationEventListSchema).query(({ input }) =>
    withTransaction((tx) => courseUserRegistrationService.listEvents(input, tx), {
      readOnly: true,
    }),
  ),
  create: trpc.procedure
    .input(courseUserRegistrationCreateSchema)
    .mutation(({ input }) =>
      withTransaction((tx) => courseUserRegistrationService.create(input, tx)),
    ),
});
