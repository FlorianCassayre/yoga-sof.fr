import { z } from 'zod';

import { legacyDatetimeSchema, legacyNullableDatetimeSchema } from '../../parse/legacyDateTime';
import {
  legacyIntSchema,
  type LegacyRowColumns,
  legacyTinyIntSchema,
} from '../../parse/legacySchemas';

export const COURSE_WAITING_LIST_TABLE = 'course_waiting_list';

export const courseWaitingListLegacySchema = z.object({
  id: legacyIntSchema,
  userId: legacyIntSchema,
  courseId: legacyIntSchema,
  isUserCanceled: legacyTinyIntSchema,
  createdAt: legacyDatetimeSchema,
  canceledAt: legacyNullableDatetimeSchema,
});

export const COURSE_WAITING_LIST_COLUMNS: LegacyRowColumns<typeof courseWaitingListLegacySchema> = {
  id: 0,
  userId: 1,
  courseId: 2,
  isUserCanceled: 3,
  createdAt: 4,
  canceledAt: 5,
};
