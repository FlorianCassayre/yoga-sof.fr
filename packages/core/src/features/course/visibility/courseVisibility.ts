import type { courseVisibilityEnum } from './courseVisibilityEnum';

export type CourseVisibility = (typeof courseVisibilityEnum.enumValues)[number];
