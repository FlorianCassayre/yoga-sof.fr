import { userGetSchema, userListSchema, userService } from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';

import { trpc } from '../../server/trpc';

export const userRouter = trpc.router({
  me: trpc.procedure.query(async () => {
    const session = await auth();
    const id = session?.user?.id;

    return id ? userService.get({ id }) : null;
  }),
  list: trpc.procedure.input(userListSchema).query(({ input }) => userService.list(input)),
  get: trpc.procedure.input(userGetSchema).query(({ input }) => userService.get(input)),
});
