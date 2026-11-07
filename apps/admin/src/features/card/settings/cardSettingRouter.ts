import {
  cardSettingService,
  cardSettingUpdateSchema,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { adminProcedure } from '../../../server/trpc';

export const cardSettingRouter = trpc.router({
  get: adminProcedure.query(() =>
    withTransaction((tx) => cardSettingService.get(tx), { readOnly: true }),
  ),
  update: adminProcedure
    .input(cardSettingUpdateSchema)
    .mutation(({ input }) => withTransaction((tx) => cardSettingService.update(input, tx))),
});
