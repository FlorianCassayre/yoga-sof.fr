import { z } from 'zod';

import {
  createSelectByIdSchema,
  createVersionedInsertSchema,
  createVersionedUpdateSchema,
} from '../../db/schemaFactory';
import { sameDay } from '../../util/date';
import { createListSchema } from '../../util/list';
import { coursesTable } from './coursesTable';

export const courseListSchema = createListSchema<typeof coursesTable>({
  capacity: true,
  endsAt: true,
  registeredCount: true,
  startsAt: true,
  type: true,
  visibility: true,
}).extend({
  upcoming: z.boolean().optional(),
});

export const courseGetSchema = createSelectByIdSchema(coursesTable);

const refineSameDay = (
  { startsAt, endsAt }: { startsAt?: Date; endsAt?: Date },
  ctx: z.RefinementCtx,
) => {
  if (startsAt !== undefined && endsAt !== undefined && !sameDay(startsAt, endsAt)) {
    ctx.addIssue({
      code: 'custom',
      path: ['endsAt'],
      message: 'La séance doit débuter et se terminer le même jour.',
    });
  }
};

export const courseCreateSchema = createVersionedInsertSchema(coursesTable)
  .omit({
    registeredCount: true,
  })
  .superRefine(refineSameDay);

export const courseEditSchema =
  createVersionedUpdateSchema(coursesTable).superRefine(refineSameDay);
