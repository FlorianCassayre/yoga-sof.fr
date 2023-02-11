import { z } from 'zod';
import { nonEmptyUniqueIdsSchema } from './common';
import { userSchemaBase } from './user';

export const frontsiteCourseRegistrationSchema = z.strictObject({
  step: z.number().int().min(0),
  userId: z.number().int().min(0).nullable(),
  courseIds: nonEmptyUniqueIdsSchema,
  consent: z.boolean().refine((value) => value, { message: `Vous devez accepter les conditions avant de continuer` }),
  notify: z.boolean(),
}).merge(userSchemaBase);
