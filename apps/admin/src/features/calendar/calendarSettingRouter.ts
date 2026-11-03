import {
  calendarSettingService,
  calendarSettingUpdateSchema,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { adminProcedure } from '../../server/trpc';

export const calendarSettingRouter = trpc.router({
  get: adminProcedure.query(() =>
    withTransaction((tx) => calendarSettingService.get(tx), { readOnly: true }),
  ),
  update: adminProcedure
    .input(calendarSettingUpdateSchema)
    .mutation(({ input }) => withTransaction((tx) => calendarSettingService.update(input, tx))),
});
