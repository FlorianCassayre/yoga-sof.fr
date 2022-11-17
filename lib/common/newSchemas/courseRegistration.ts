import { z } from 'zod';
import { CourseType } from '@prisma/client';
import { colonTimeToParts, timePartsToTotalMinutes, WeekdayNames } from '../newDate';

const uniqueIdsSchema = z.array(z.number().int().min(0)).nonempty()
  .refine(array => new Set(array).size === array.length, { message: `Les éléments doivent être distincts` });

export const courseRegistrationCreateSchema = z.strictObject({
  courses: uniqueIdsSchema,
  users: uniqueIdsSchema,
  notify: z.boolean(),
});
