import {
  membershipPriceCreateSchema,
  membershipPriceDeleteSchema,
  membershipPriceEditSchema,
  membershipPriceGetSchema,
  membershipPriceListSchema,
  membershipPriceService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure, settingsProcedure } from '../../../server/trpc';

export const membershipPriceRouter = trpc.router({
  list: readProcedure
    .input(membershipPriceListSchema)
    .query(({ input }) =>
      withTransaction((tx) => membershipPriceService.list(input, tx), { readOnly: true }),
    ),
  get: readProcedure
    .input(membershipPriceGetSchema)
    .query(({ input }) =>
      withTransaction((tx) => membershipPriceService.get(input, tx), { readOnly: true }),
    ),
  create: settingsProcedure
    .input(membershipPriceCreateSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipPriceService.create(input, tx))),
  update: settingsProcedure
    .input(membershipPriceEditSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipPriceService.update(input, tx))),
  delete: settingsProcedure
    .input(membershipPriceDeleteSchema)
    .mutation(({ input }) => withTransaction((tx) => membershipPriceService.delete(input, tx))),
});
