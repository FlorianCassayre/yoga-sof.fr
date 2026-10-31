import {
  membershipSettingService,
  membershipSettingUpdateSchema,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

export const membershipSettingRouter = trpc.router({
  get: trpc.procedure.query(() =>
    withTransaction((tx) => membershipSettingService.get(tx), { readOnly: true }),
  ),
  update: trpc.procedure
    .input(membershipSettingUpdateSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipSettingService.update(input, tx))),
});
