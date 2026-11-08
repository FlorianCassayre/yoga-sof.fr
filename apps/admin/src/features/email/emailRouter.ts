import {
  emailCreateSchema,
  emailGetSchema,
  emailListSchema,
  emailService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, writeProcedure } from '../../server/trpc';

export const emailRouter = trpc.router({
  list: readProcedure
    .input(emailListSchema)
    .query(({ input }) =>
      withTransaction((tx) => emailService.list(input, tx), { readOnly: true }),
    ),
  get: readProcedure
    .input(emailGetSchema)
    .query(({ input }) => withTransaction((tx) => emailService.get(input, tx), { readOnly: true })),
  attachments: readProcedure
    .input(emailGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => emailService.listAttachments(input, tx), { readOnly: true }),
    ),
  resend: writeProcedure
    .input(emailGetSchema)
    .mutation(({ input }) => withTransaction((tx) => emailService.resend(input, tx))),
  create: writeProcedure
    .input(emailCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => emailService.create(input, tx))),
});
