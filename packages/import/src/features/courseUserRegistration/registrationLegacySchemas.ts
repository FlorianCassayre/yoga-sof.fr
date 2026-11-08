import { z } from 'zod';

import { legacyDatetimeSchema, legacyNullableDatetimeSchema } from '../../parse/legacyDateTime';
import {
  legacyIntSchema,
  type LegacyRowColumns,
  legacyTinyIntSchema,
} from '../../parse/legacySchemas';

export const REGISTRATIONS_TABLE = 'course_registration';

export const registrationLegacySchema = z.object({
  id: legacyIntSchema,
  userId: legacyIntSchema,
  courseId: legacyIntSchema,
  isUserCanceled: legacyTinyIntSchema,
  createdAt: legacyDatetimeSchema,
  canceledAt: legacyNullableDatetimeSchema,
  attended: legacyTinyIntSchema.nullable(),
});

export const REGISTRATION_COLUMNS: LegacyRowColumns<typeof registrationLegacySchema> = {
  id: 0,
  userId: 1,
  courseId: 2,
  isUserCanceled: 3,
  createdAt: 5,
  canceledAt: 6,
  attended: 7,
};
