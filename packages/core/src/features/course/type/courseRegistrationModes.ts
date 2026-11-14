import type { CourseType } from './CourseType';

export const COURSE_TYPE_REGISTRATION_MODES = {
  adulte: 'individual',
  enfant: 'bundle',
} as const satisfies Record<CourseType, 'individual' | 'bundle'>;

export type CourseRegistrationMode = (typeof COURSE_TYPE_REGISTRATION_MODES)[CourseType];
