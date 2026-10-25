import { asc, eq } from 'drizzle-orm';
import type { z } from 'zod';

import { db } from '../../db/db';
import { assertFound } from '../../errors';
import { paginatedList, sortOrder } from '../../list';
import { usersTable } from '../auth/tables';
import type { userGetSchema, userListSchema } from './userSchemas';

export const userService = {
  list: ({ sort, ...params }: z.infer<typeof userListSchema>) => {
    const orderBys = (sort ?? []).map((item) => sortOrder(usersTable, item));

    return paginatedList<typeof usersTable.$inferSelect>(db, usersTable, params, {
      orderBy: orderBys.length === 0 ? [asc(usersTable.name)] : orderBys,
    });
  },

  get: async ({ id }: z.infer<typeof userGetSchema>) => {
    const [row] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);

    assertFound(row, "L'utilisateur est introuvable");

    return row;
  },
};
