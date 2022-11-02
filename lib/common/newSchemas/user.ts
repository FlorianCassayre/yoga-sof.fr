import { z } from 'zod';
import { CourseType } from '@prisma/client';
import { colonTimeToParts, timePartsToTotalMinutes, WeekdayNames } from '../newDate';

const userSchemaBase = z.object({
  name: z.string().min(1),
  email: z.string().email().nullable(),
});

export const userFindSchema = z.object({
  id: z.number().int().min(0),
});

export const userUpdateSchema = userSchemaBase.merge(userFindSchema);

export const userCreateSchema = userSchemaBase;

export const userFindTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});
