import { userGetSchema, userListSchema, userService, withTransaction } from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { trpc } from '@yoga-sof/ui/trpc';

import { adminProcedure, panelProcedure } from '../../server/trpc';

export const userRouter = trpc.router({
  me: panelProcedure.query(async () => {
    const session = await auth();
    const id = session?.user?.id;

    return id ? withTransaction((tx) => userService.get({ id }, tx), { readOnly: true }) : null;
  }),
  list: adminProcedure
    .input(userListSchema)
    .query(({ input }) => withTransaction((tx) => userService.list(input, tx), { readOnly: true })),
  get: adminProcedure
    .input(userGetSchema)
    .query(({ input }) => withTransaction((tx) => userService.get(input, tx), { readOnly: true })),
});
