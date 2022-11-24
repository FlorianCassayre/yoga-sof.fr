import { z } from 'zod';
import { CourseType } from '@prisma/client';
import { colonTimeToParts, timePartsToTotalMinutes, WeekdayNames } from '../newDate';

const refineTimeRange: z.RefinementEffect<{ timeStart: string, timeEnd: string }>["refinement"] = ({ timeStart, timeEnd }, ctx) => {
  const toMinutes = (time: string): number => timePartsToTotalMinutes(colonTimeToParts(time));
  if (!(toMinutes(timeStart) < toMinutes(timeEnd))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['timeStart'],
      message: `L'heure de début ne peut pas apparaître après l'heure de fin`,
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['timeEnd'],
      message: `L'heure de fin ne peut pas apparaître avant l'heure de début`,
    });
  }
};

const timeSchema = z.string().refine((value) => {
  try {
    colonTimeToParts(value);
    return true;
  } catch (e) {
    return false;
  }
}, {
  message: 'Heure HH:MM invalide',
});

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
