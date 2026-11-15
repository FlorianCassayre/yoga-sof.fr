import { sql } from 'drizzle-orm';
import { check, integer, pgTable, text } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../db/idVersionedColumns';
import { courseTypeEnum } from '../course/type/courseTypeEnum';
import { courseSuperBundlesTable } from '../courseSuperBundle/courseSuperBundlesTable';

export const courseBundlesTable = pgTable(
  'course_bundles',
  {
    ...idVersionedColumns,
    label: text().notNull(),
    type: courseTypeEnum().notNull(),
    price: integer().notNull(),
    courseSuperBundleId: integer().references(() => courseSuperBundlesTable.id),
  },
  (table) => [check('price_nonnegative', sql`${table.price} >= 0`)],
);
