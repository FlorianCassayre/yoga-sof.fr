import { sql } from 'drizzle-orm';
import { check, date, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';

import { idColumns } from '../../db/idColumns';
import { membershipTypeEnum } from './type/membershipTypeEnum';

export const membershipsTable = pgTable(
  'memberships',
  {
    ...idColumns,
    type: membershipTypeEnum().notNull(),
    price: integer().notNull(),
    startsAt: date().notNull(),
    endsAt: date().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('price_nonnegative', sql`${table.price} >= 0`),
    check('period_consistency', sql`${table.startsAt} <= ${table.endsAt}`),
  ],
);
