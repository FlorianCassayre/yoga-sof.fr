import { gt } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { createRow, getRow, updateRow } from '../../db/rows';
import { paginatedList } from '../../list';
import { courseLabelSql } from './courseLabelSql';
import type {
  courseCreateSchema,
  courseEditSchema,
  courseGetSchema,
  courseListSchema,
} from './courseSchemas';
import { coursesTable } from './coursesTable';

export const courseService = {
  list: (input: z.infer<typeof courseListSchema>, tx: DbTransaction) =>
    paginatedList<typeof coursesTable.$inferSelect>(tx, coursesTable, input, {
      searchColumns: [courseLabelSql],
      where: input.upcoming ? gt(coursesTable.endsAt, new Date()) : undefined,
    }),

  get: ({ id }: z.infer<typeof courseGetSchema>, tx: DbTransaction) =>
    getRow<typeof coursesTable.$inferSelect>(tx, coursesTable, id, 'La séance est introuvable'),

  create: (values: z.infer<typeof courseCreateSchema>, tx: DbTransaction) =>
    createRow<typeof coursesTable.$inferSelect>(
      tx,
      coursesTable,
      values,
      'Création de la séance impossible.',
    ),

  update: (values: z.infer<typeof courseEditSchema>, tx: DbTransaction) =>
    updateRow<typeof coursesTable.$inferSelect>(
      tx,
      coursesTable,
      values,
      'La séance a été modifiée entre-temps, rechargez la page.',
    ),
};
