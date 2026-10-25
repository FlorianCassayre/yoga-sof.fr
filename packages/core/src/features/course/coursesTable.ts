import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { idVersionedColumns } from '../../db/idVersionedColumns';
import { courseTypeEnum } from './type/courseTypeEnum';
import { courseVisibilityEnum } from './visibility/courseVisibilityEnum';

export const coursesTable = pgTable('courses', {
  ...idVersionedColumns,
  type: courseTypeEnum().notNull(),
  startsAt: timestamp({ withTimezone: true }).notNull(),
  endsAt: timestamp({ withTimezone: true }).notNull(),
  capacity: integer().notNull(),
  registeredCount: integer().notNull().default(0),
  visibility: courseVisibilityEnum().notNull(),
  internalNotes: text().notNull().default(''),
});
