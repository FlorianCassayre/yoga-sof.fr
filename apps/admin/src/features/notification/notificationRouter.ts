import {
  notificationListSchema,
  notificationService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure } from '../../server/trpc';

export const notificationRouter = trpc.router({
  list: readProcedure
    .input(notificationListSchema)
    .query(({ input }) =>
      withTransaction((tx) => notificationService.list(input, tx), { readOnly: true }),
    ),
  count: readProcedure.query(() =>
    withTransaction((tx) => notificationService.count(tx), { readOnly: true }),
  ),
});
