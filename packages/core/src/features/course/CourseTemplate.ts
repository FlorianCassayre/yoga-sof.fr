import type { Weekday } from '../../util/date';
import type { CourseType } from './type/CourseType';

export interface CourseTemplate {
  weekday: Weekday;
  type: CourseType;
  bundleId?: number;
  startTime: string;
  endTime: string;
  capacity: number | null;
  price: number | null;
}
