import { sql } from 'drizzle-orm';
import { check, pgTable, smallint } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../../db/idVersionedColumns';

export const membershipSettingsTable = pgTable(
  'membership_settings',
  {
    ...idVersionedColumns,
    seasonStartMonth: smallint().notNull(),
  },
  (table) => [check('season_start_month_range', sql`${table.seasonStartMonth} BETWEEN 1 AND 12`)],
);
