import type { courseTypeEnum } from './courseTypeEnum';

export type CourseType = (typeof courseTypeEnum.enumValues)[number];
