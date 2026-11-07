import {
  courseUserRegistrationCreateSchema,
  courseUserRegistrationEventListSchema,
  courseUserRegistrationListSchema,
  courseUserRegistrationPendingPresenceSchema,
  courseUserRegistrationService,
  courseUserRegistrationSetPresenceSchema,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, writeProcedure } from '../../server/trpc';

export const courseUserRegistrationRouter = trpc.router({
  list: readProcedure
    .input(courseUserRegistrationListSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseUserRegistrationService.list(input, tx), { readOnly: true }),
    ),
  listEvents: readProcedure.input(courseUserRegistrationEventListSchema).query(({ input }) =>
    withTransaction((tx) => courseUserRegistrationService.listEvents(input, tx), {
      readOnly: true,
    }),
  ),
  pendingPresence: readProcedure
    .input(courseUserRegistrationPendingPresenceSchema)
    .query(({ input }) =>
      withTransaction((tx) => courseUserRegistrationService.pendingPresence(input, tx), {
        readOnly: true,
      }),
    ),
  create: writeProcedure
    .input(courseUserRegistrationCreateSchema)
    .mutation(({ input }) =>
      withTransaction((tx) => courseUserRegistrationService.create(input, tx)),
    ),
  setPresence: writeProcedure
    .input(courseUserRegistrationSetPresenceSchema)
    .mutation(({ input }) =>
      withTransaction((tx) => courseUserRegistrationService.setPresence(input, tx)),
    ),
});
