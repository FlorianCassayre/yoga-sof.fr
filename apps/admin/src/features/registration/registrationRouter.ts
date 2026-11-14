import {
  registrationCoursePresenceListSchema,
  registrationCreateSchema,
  registrationEventListSchema,
  registrationListSchema,
  registrationPendingPresenceSchema,
  registrationService,
  registrationSetPresenceSchema,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, writeProcedure } from '../../server/trpc';
import { createRegistrationEmails } from './registrationEmails';

export const registrationRouter = trpc.router({
  list: readProcedure
    .input(registrationListSchema)
    .query(({ input }) =>
      withTransaction((tx) => registrationService.list(input, tx), { readOnly: true }),
    ),
  listCoursePresence: readProcedure.input(registrationCoursePresenceListSchema).query(({ input }) =>
    withTransaction((tx) => registrationService.listCoursePresence(input, tx), {
      readOnly: true,
    }),
  ),
  listEvents: readProcedure.input(registrationEventListSchema).query(({ input }) =>
    withTransaction((tx) => registrationService.listEvents(input, tx), {
      readOnly: true,
    }),
  ),
  pendingPresence: readProcedure.input(registrationPendingPresenceSchema).query(({ input }) =>
    withTransaction((tx) => registrationService.pendingPresence(input, tx), {
      readOnly: true,
    }),
  ),
  create: writeProcedure.input(registrationCreateSchema).mutation(({ input }) =>
    withTransaction(async (tx) => {
      const registrations = await registrationService.create(input, tx);
      if (input.notify) {
        await createRegistrationEmails(tx, registrations);
      }
    }),
  ),
  setPresence: writeProcedure
    .input(registrationSetPresenceSchema)
    .mutation(({ input }) => withTransaction((tx) => registrationService.setPresence(input, tx))),
});
