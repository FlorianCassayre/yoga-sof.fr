import {
  membershipSettingService,
  membershipSettingUpdateSchema,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, settingsProcedure } from '../../../server/trpc';

export const membershipSettingRouter = trpc.router({
  get: readProcedure.query(() =>
    withTransaction((tx) => membershipSettingService.get(tx), { readOnly: true }),
  ),
  update: settingsProcedure
    .input(membershipSettingUpdateSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipSettingService.update(input, tx))),
});
