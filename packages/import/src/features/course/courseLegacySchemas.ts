import type { CourseType } from '@yoga-sof/core';
import { z } from 'zod';

import { legacyCourseInstantSchema } from '../../parse/legacyDateTime';
import {
  legacyIntSchema,
  type LegacyRowColumns,
  legacyTextSchema,
  legacyTinyIntSchema,
} from '../../parse/legacySchemas';

export const COURSES_TABLE = 'course';

export const courseLegacySchema = z.object({
  id: legacyIntSchema,
  type: z.enum(['YOGA_ADULT', 'YOGA_CHILD', 'YOGA_ADULT_CHILD']),
  slots: legacyIntSchema,
  dateStart: legacyCourseInstantSchema,
  dateEnd: legacyCourseInstantSchema,
  isCanceled: legacyTinyIntSchema,
  notes: legacyTextSchema,
  visible: legacyTinyIntSchema,
});

export const COURSE_COLUMNS: LegacyRowColumns<typeof courseLegacySchema> = {
  id: 0,
  type: 1,
  slots: 2,
  dateStart: 4,
  dateEnd: 5,
  isCanceled: 6,
  notes: 8,
  visible: 12,
};

export const COURSE_TYPES: Record<
  z.output<typeof courseLegacySchema>['type'],
  CourseType | undefined
> = {
  YOGA_ADULT: 'adulte',
  YOGA_CHILD: 'enfant',
  YOGA_ADULT_CHILD: undefined,
};
