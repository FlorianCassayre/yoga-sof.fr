import {
  courseUserWaitingListListSchema,
  courseUserWaitingListService,
  withTransaction,
} from '@yoga-sof/core/server';
import { trpc } from '@yoga-sof/ui/trpc';

import { readProcedure } from '../../server/trpc';

export const courseUserWaitingListRouter = trpc.router({
  list: readProcedure.input(courseUserWaitingListListSchema).query(({ input }) =>
    withTransaction((tx) => courseUserWaitingListService.list(input, tx), {
      readOnly: true,
    }),
  ),
});
