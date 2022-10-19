import { CourseType } from '@prisma/client';

export const CourseTypeNames: { [K in CourseType]: string } = {
  [CourseType.YOGA_ADULT]: 'Yoga adulte',
  [CourseType.YOGA_CHILD]: 'Yoga enfant',
  [CourseType.YOGA_ADULT_CHILD]: 'Yoga parent-enfant',
}
