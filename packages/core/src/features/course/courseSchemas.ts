import { z } from 'zod';

import { createSelectByIdSchema, createVersionedUpdateSchema } from '../../db/schemaFactory';
import { sameDay, timeSchema } from '../../util/date';
import { createListSchema } from '../../util/list';
import { coursesTable } from './coursesTable';
import { courseTypeEnum } from './type/courseTypeEnum';
import { courseVisibilityEnum } from './visibility/courseVisibilityEnum';

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

// Widest view: a six-week month grid plus one day of DST margin.
const CALENDAR_GRID_WEEKS = 6;
const calendarMaxRangeMs = (CALENDAR_GRID_WEEKS * 7 + 1) * 24 * 60 * 60 * 1000;

export const courseCalendarListSchema = z
  .object({ start: z.date(), end: z.date() })
  .refine(({ start, end }) => start.getTime() < end.getTime(), {
    message: 'La plage de dates est invalide.',
  })
  .refine(({ start, end }) => end.getTime() - start.getTime() <= calendarMaxRangeMs, {
    message: 'La plage de dates demandée est trop grande.',
  });

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

export const courseEditSchema =
  createVersionedUpdateSchema(coursesTable).superRefine(refineSameDay);

const refineTemplateTimes = (
  { templates }: { templates: { startTime: string; endTime: string }[] },
  ctx: z.RefinementCtx,
) => {
  templates.forEach((template, index) => {
    if (template.endTime <= template.startTime) {
      ctx.addIssue({
        code: 'custom',
        path: ['templates', index, 'endTime'],
        message: "L'heure de fin doit être postérieure à l'heure de début.",
      });
    }
  });
};

export const courseBatchCreateSchema = z
  .object({
    visibility: z.enum(courseVisibilityEnum.enumValues),
    templates: z.array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        type: z.enum(courseTypeEnum.enumValues),
        startTime: timeSchema,
        endTime: timeSchema,
        capacity: z.preprocess(
          (value) => (value === '' || value === null ? undefined : value),
          z.coerce.number().int().min(0),
        ),
      }),
    ),
    weeks: z.array(z.string().date()),
  })
  .superRefine(refineTemplateTimes);
