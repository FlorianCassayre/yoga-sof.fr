import { z } from 'zod';
import { nonEmptyUniqueIdsSchema } from './common';
import { userSchemaBase } from './user';

export const frontsiteCourseRegistrationSchema = z.strictObject({
  step: z.number().int().min(0),
  courseIds: nonEmptyUniqueIdsSchema,
  consent: z.boolean().refine((value) => value, { message: `Vous devez accepter les conditions pour pouvoir continuer` }),
  notify: z.boolean(),
}).merge(userSchemaBase);
