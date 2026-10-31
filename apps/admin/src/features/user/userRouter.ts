import { userGetSchema, userListSchema, userService, withTransaction } from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { trpc } from '@yoga-sof/ui/trpc';

export const userRouter = trpc.router({
  me: trpc.procedure.query(async () => {
    const session = await auth();
    const id = session?.user?.id;

    return id ? withTransaction((tx) => userService.get({ id }, tx), { readOnly: true }) : null;
  }),
  list: trpc.procedure
    .input(userListSchema)
    .query(({ input }) => withTransaction((tx) => userService.list(input, tx), { readOnly: true })),
  get: trpc.procedure
    .input(userGetSchema)
    .query(({ input }) => withTransaction((tx) => userService.get(input, tx), { readOnly: true })),
});
