import { sql } from 'drizzle-orm';
import { check, integer, pgTable, text } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../db/idVersionedColumns';

export const courseSuperBundlesTable = pgTable(
  'course_super_bundles',
  {
    ...idVersionedColumns,
    label: text().notNull(),
    price: integer().notNull(),
  },
  (table) => [check('price_nonnegative', sql`${table.price} >= 0`)],
);
