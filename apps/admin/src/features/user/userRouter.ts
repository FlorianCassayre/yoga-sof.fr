import {
  roleService,
  userGetSchema,
  userListSchema,
  userService,
  withTransaction,
} from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure } from '../../server/trpc';

export const userRouter = trpc.router({
  me: readProcedure.query(async () => {
    const session = await auth();
    const id = session?.user?.id;

    return id
      ? withTransaction(
          async (tx) => ({
            ...(await userService.get({ id }, tx)),
            permissions: await roleService.getUserPermissions(id, tx),
          }),
          { readOnly: true },
        )
      : null;
  }),
  list: readProcedure
    .input(userListSchema)
    .query(({ input }) => withTransaction((tx) => userService.list(input, tx), { readOnly: true })),
  get: readProcedure
    .input(userGetSchema)
    .query(({ input }) => withTransaction((tx) => userService.get(input, tx), { readOnly: true })),
});
