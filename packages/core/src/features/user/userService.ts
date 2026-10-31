import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { getRow } from '../../db/rows';
import { paginatedList } from '../../util/list';
import { usersTable } from '../auth/authTables';
import type { userGetSchema, userListSchema } from './userSchemas';

export const userService = {
  list: (input: z.infer<typeof userListSchema>, tx: DbTransaction) =>
    paginatedList<typeof usersTable.$inferSelect>(tx, usersTable, input, {
      searchColumns: [usersTable.name, usersTable.email],
    }),

  get: ({ id }: z.infer<typeof userGetSchema>, tx: DbTransaction) =>
    getRow<typeof usersTable.$inferSelect>(tx, usersTable, id, "L'utilisateur est introuvable"),
};
