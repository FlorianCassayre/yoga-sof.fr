import { z } from 'zod';
import { CourseType } from '@prisma/client';
import { WeekdayNames } from '../newDate';
import { refineTimeRange, timeSchema } from './common';

const courseModelSchemaBase = z.object({
  type: z.nativeEnum(CourseType),
  weekday: z.number().int().min(0).max(WeekdayNames.length - 1),
  timeStart: timeSchema,
  timeEnd: timeSchema,
  slots: z.number().int().min(1).max(99),
  price: z.number().int().min(0).max(99),
  bundle: z.boolean(),
});

export const courseModelFindSchema = z.object({
  id: z.number().int().min(0),
});

export const courseModelUpdateSchema = courseModelSchemaBase.merge(courseModelFindSchema).superRefine(refineTimeRange);

export const courseModelCreateSchema = courseModelSchemaBase.superRefine(refineTimeRange);

export const courseModelGetTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});
