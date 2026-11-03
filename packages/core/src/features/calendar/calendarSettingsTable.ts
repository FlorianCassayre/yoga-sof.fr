import { sql } from 'drizzle-orm';
import { check, pgTable, time } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../db/idVersionedColumns';

export const calendarSettingsTable = pgTable(
  'calendar_settings',
  {
    ...idVersionedColumns,
    dayStartsAt: time().notNull(),
    dayEndsAt: time().notNull(),
  },
  (table) => [check('day_period_consistency', sql`${table.dayStartsAt} < ${table.dayEndsAt}`)],
);
