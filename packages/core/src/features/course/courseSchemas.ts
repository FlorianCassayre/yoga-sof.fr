import { z } from 'zod';

import { createSelectByIdSchema, createVersionedUpdateSchema } from '../../db/schemaFactory';
import { optionalPriceSchema } from '../../util/currency';
import { sameDay, timeSchema } from '../../util/date';
import { listSchema, sortSchema } from '../../util/list';
import { coursesTable } from './coursesTable';
import { courseTypeEnum } from './type/courseTypeEnum';
import { courseVisibilityEnum } from './visibility/courseVisibilityEnum';

export const courseListSchema = listSchema.extend({
  sort: sortSchema({
    bundleLabel: true,
    capacity: true,
    endsAt: true,
    price: true,
    registeredCount: true,
    startsAt: true,
    type: true,
    visibility: true,
  }),
  upcoming: z.boolean().optional(),
  courseBundleId: z.number().int().optional(),
  individual: z.boolean().optional(),
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

export const courseEditSchema = createVersionedUpdateSchema(coursesTable)
  .omit({ type: true, price: true, courseBundleId: true })
  .extend({
    capacity: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.coerce.number().int().min(0).optional(),
    ),
  })
  .superRefine(refineSameDay);

export const courseBatchCreateSchema = z
  .object({
    visibility: z.enum(courseVisibilityEnum.enumValues),
    capacity: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.coerce.number().int().min(0).optional(),
    ),
    templates: z.array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        type: z.enum(courseTypeEnum.enumValues).optional(),
        bundleId: z.number().int().optional(),
        startTime: timeSchema,
        endTime: timeSchema,
        capacity: z.preprocess(
          (value) => (value === '' || value === null ? undefined : value),
          z.coerce.number().int().min(0).optional(),
        ),
        price: optionalPriceSchema,
      }),
    ),
    weeks: z.array(z.string().date()),
  })
  .superRefine(({ capacity, templates }, ctx) => {
    templates.forEach((template, index) => {
      if (template.endTime <= template.startTime) {
        ctx.addIssue({
          code: 'custom',
          path: ['templates', index, 'endTime'],
          message: "L'heure de fin doit être postérieure à l'heure de début.",
        });
      }
      if (template.bundleId === undefined) {
        if (template.type === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: ['templates', index, 'type'],
            message: 'Le type est requis.',
          });
        }
        if (template.capacity === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: ['templates', index, 'capacity'],
            message: 'La capacité est requise.',
          });
        }
        if (template.price === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: ['templates', index, 'price'],
            message: 'Le prix est requis.',
          });
        }
      }
    });
    if (templates.some((template) => template.bundleId !== undefined) && capacity === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['capacity'],
        message: 'La capacité est requise.',
      });
    }
  });
