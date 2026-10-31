import { sql } from 'drizzle-orm';
import { check, integer, pgTable, uniqueIndex } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../../db/idVersionedColumns';
import { membershipTypeEnum } from '../type/membershipTypeEnum';

export const membershipPricesTable = pgTable(
  'membership_prices',
  {
    ...idVersionedColumns,
    type: membershipTypeEnum().notNull(),
    price: integer().notNull(),
  },
  (table) => [
    uniqueIndex('membership_prices_type_unique').on(table.type),
    check('price_nonnegative', sql`${table.price} >= 0`),
  ],
);
