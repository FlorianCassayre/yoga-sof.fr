import {
  calendarSettingService,
  calendarSettingUpdateSchema,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, settingsProcedure } from '../../server/trpc';

export const calendarSettingRouter = trpc.router({
  get: readProcedure.query(() =>
    withTransaction((tx) => calendarSettingService.get(tx), { readOnly: true }),
  ),
  update: settingsProcedure
    .input(calendarSettingUpdateSchema)
    .mutation(({ input }) => withTransaction((tx) => calendarSettingService.update(input, tx))),
});
