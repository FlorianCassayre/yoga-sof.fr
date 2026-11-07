import type { Weekday } from '../../util/date';
import type { CourseType } from './type/CourseType';

export interface CourseTemplate {
  weekday: Weekday;
  type: CourseType;
  startTime: string;
  endTime: string;
  capacity: number;
}
