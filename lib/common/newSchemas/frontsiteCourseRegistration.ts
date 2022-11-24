import { z } from 'zod';
import { nonEmptyUniqueIdsSchema } from './common';

export const frontsiteCourseRegistrationSchema = z.strictObject({
  step: z.number().int().min(0),
  courseIds: nonEmptyUniqueIdsSchema,
  acceptConditions: z.boolean().refine((value) => value, { message: `Vous devez accepter les conditions pour pouvoir continuer` }),
  notify: z.boolean(),
  name: z.string().min(1),
  email: z.string().email().nullish(),
});
