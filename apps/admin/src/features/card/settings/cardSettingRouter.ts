import {
  cardSettingService,
  cardSettingUpdateSchema,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, settingsProcedure } from '../../../server/trpc';

export const cardSettingRouter = trpc.router({
  get: readProcedure.query(() =>
    withTransaction((tx) => cardSettingService.get(tx), { readOnly: true }),
  ),
  update: settingsProcedure
    .input(cardSettingUpdateSchema)
    .mutation(({ input }) => withTransaction((tx) => cardSettingService.update(input, tx))),
});
