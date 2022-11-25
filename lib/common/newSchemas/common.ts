import { z } from 'zod';
import { colonTimeToParts, timePartsToTotalMinutes } from '../newDate';

export const idSchema = z.number().int().min(0);

export const nonEmptyUniqueIdsSchema = z.array(idSchema).nonempty()
  .refine(array => new Set(array).size === array.length, { message: `Les éléments doivent être distincts` });

export const refineTimeRange: z.RefinementEffect<{ timeStart: string, timeEnd: string }>["refinement"] = ({ timeStart, timeEnd }, ctx) => {
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

export const timeSchema = z.string().refine((value) => {
  try {
    colonTimeToParts(value);
    return true;
  } catch (e) {
    return false;
  }
}, {
  message: 'Heure HH:MM invalide',
});
