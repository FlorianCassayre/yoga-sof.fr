import { roleListSchema, roleService, withTransaction } from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure } from '../../server/trpc';

export const roleRouter = trpc.router({
  list: readProcedure
    .input(roleListSchema)
    .query(({ input }) => withTransaction((tx) => roleService.list(input, tx), { readOnly: true })),
});
