import { createSchemaFactory } from 'drizzle-orm/zod';
import { z } from 'zod';

import { listSchema, type SortableColumns, sortSchema } from '../../list';
import { coursesTable } from './coursesTable';

const { createInsertSchema } = createSchemaFactory({ coerce: { date: true, number: true } });

const SORTABLE_COLUMNS = {
  capacity: true,
  endsAt: true,
  registeredCount: true,
  startsAt: true,
  type: true,
  visibility: true,
} as const satisfies SortableColumns<typeof coursesTable>;

export type CourseSortField = keyof typeof SORTABLE_COLUMNS;

export const courseListSchema = listSchema.extend({
  sort: sortSchema(SORTABLE_COLUMNS),
});

export const courseGetSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const courseCreateSchema = createInsertSchema(coursesTable).omit({
  registeredCount: true,
  version: true,
});

export const courseEditSchema = courseCreateSchema.extend({
  id: z.coerce.number().int().positive(),
  version: z.coerce.number().int().positive(),
});
