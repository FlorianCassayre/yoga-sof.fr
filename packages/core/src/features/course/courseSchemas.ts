import { z } from 'zod';

import {
  createSelectByIdSchema,
  createVersionedInsertSchema,
  createVersionedUpdateSchema,
} from '../../db/schemaFactory';
import { createListSchema, type SortableColumns } from '../../list';
import { coursesTable } from './coursesTable';

const SORTABLE_COLUMNS = {
  capacity: true,
  endsAt: true,
  registeredCount: true,
  startsAt: true,
  type: true,
  visibility: true,
} as const satisfies SortableColumns<typeof coursesTable>;

export const courseListSchema = createListSchema(SORTABLE_COLUMNS).extend({
  upcoming: z.boolean().optional(),
});

export const courseGetSchema = createSelectByIdSchema(coursesTable);

export const courseCreateSchema = createVersionedInsertSchema(coursesTable).omit({
  registeredCount: true,
});

export const courseEditSchema = createVersionedUpdateSchema(coursesTable);
