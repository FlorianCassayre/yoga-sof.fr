import { and, asc, eq } from 'drizzle-orm';
import type { z } from 'zod';

import { db } from '../../db/db';
import { paginatedList, sortOrder } from '../../list';
import type {
  courseCreateSchema,
  courseEditSchema,
  courseGetSchema,
  courseListSchema,
} from './courseSchemas';
import { coursesTable } from './coursesTable';

export const courseService = {
  list: ({ sort, ...params }: z.infer<typeof courseListSchema>) => {
    const orderBys = (sort ?? []).map((item) => sortOrder(coursesTable, item));

    return paginatedList<typeof coursesTable.$inferSelect>(db, coursesTable, params, {
      orderBy: orderBys.length === 0 ? [asc(coursesTable.startsAt)] : orderBys,
    });
  },

  get: async ({ id }: z.infer<typeof courseGetSchema>) => {
    const [row] = await db.select().from(coursesTable).where(eq(coursesTable.id, id)).limit(1);

    return row ?? null;
  },

  create: async (values: z.infer<typeof courseCreateSchema>) => {
    const [row] = await db.insert(coursesTable).values(values).returning();

    return row ?? null;
  },

  update: async ({ id, version, ...values }: z.infer<typeof courseEditSchema>) => {
    const [row] = await db
      .update(coursesTable)
      .set({ ...values, version: version + 1 })
      .where(and(eq(coursesTable.id, id), eq(coursesTable.version, version)))
      .returning();

    return row ?? null;
  },
};
