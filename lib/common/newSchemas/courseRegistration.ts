import { z } from 'zod';
import { nonEmptyUniqueIdsSchema } from './common';

export const courseRegistrationCreateSchema = z.strictObject({
  courses: nonEmptyUniqueIdsSchema,
  users: nonEmptyUniqueIdsSchema,
  notify: z.boolean(),
});
