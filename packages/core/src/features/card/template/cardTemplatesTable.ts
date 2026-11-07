import { sql } from 'drizzle-orm';
import { check, integer, pgTable } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../../db/idVersionedColumns';
import { courseTypeEnum } from '../../course/type/courseTypeEnum';

export const cardTemplatesTable = pgTable(
  'card_templates',
  {
    ...idVersionedColumns,
    type: courseTypeEnum().notNull(),
    price: integer().notNull(),
    count: integer().notNull(),
  },
  (table) => [
    check('price_nonnegative', sql`${table.price} >= 0`),
    check('count_positive', sql`${table.count} > 0`),
  ],
);
