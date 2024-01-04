import { z } from 'zod';
import { CourseType } from '@prisma/client';
import { formatDateDDsMMsYYYY } from '../date';
import { refineTimeRange, timeSchema } from './common';

export const courseFindSchema = z.object({
  id: z.number().int().min(0),
});

const courseSchemaBase = z.object({
  price: z.number().int().min(0).max(99),
  slots: z.number().int().min(1).max(99),
  visible: z.boolean(),
});

export const courseUpdateSchema = courseSchemaBase.merge(courseFindSchema);

export const courseCreateManySchema = z.object({
  type: z.nativeEnum(CourseType),
  timeStart: timeSchema,
  timeEnd: timeSchema,
  dates: z.array(z.date()).min(1).refine(dates =>
    new Set(dates.map(date => formatDateDDsMMsYYYY(date))).size === dates.length,
    { message: `Les dates doivent être distinctes` },
  ),
}).merge(courseSchemaBase).superRefine(refineTimeRange); // FIXME

export const courseFindTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});

export const courseUpdateNotesSchema = z.object({
  notes: z.string().nullable(),
}).merge(courseFindSchema);
