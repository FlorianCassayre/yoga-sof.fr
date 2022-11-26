import { Course, CourseModel, User } from '@prisma/client';
import { CourseTypeNames } from './course';
import {
  formatColonTimeHHhMM,
  formatDateDDsmmYYYY,
  formatDayRange,
  formatTimeHHhMM,
  formatWeekday,
  WeekdayNames
} from './date';

export const displayCourseName = ({ type, dateStart, dateEnd }: Pick<Course, 'type' | 'dateStart' | 'dateEnd'>, capitalize = true) => [
  capitalize ? 'Séance' : 'séance',
  CourseTypeNames[type].toLowerCase(),
  'du',
  formatWeekday(dateStart, false),
  formatDateDDsmmYYYY(dateStart),
  formatDayRange(dateStart, dateEnd, false),
  'de',
  formatTimeHHhMM(dateStart),
  'à',
  formatTimeHHhMM(dateStart),
].join(' ');

export const displayCourseModelName = ({ type, weekday, timeStart, timeEnd, bundle }: CourseModel, capitalize = true) => [
  capitalize ? CourseTypeNames[type] : CourseTypeNames[type].toLowerCase(),
  'le',
  WeekdayNames[weekday].toLowerCase(),
  'de',
  formatColonTimeHHhMM(timeStart),
  'à',
  formatColonTimeHHhMM(timeEnd),
].concat(bundle ? ['(lot)'] : []).join(' ');

/*export const displayDateOnly = date => format(new Date(date), dateFormat);

export const displayDatetime = date => formatTimestamp(date);*/

/*export const displayTimePeriod = (dateStart: ConstructorParameters<typeof Date>[0], dateEnd: ConstructorParameters<typeof Date>[0]) => [
  format(new Date(dateStart), `HH'h'mm`),
  'à',
  format(new Date(dateEnd), `HH'h'mm`),
].join(' ');*/

export const displayUserName = ({ customName, name, customEmail, email, id }: Pick<User, 'customName' | 'name' | 'customEmail' | 'email' | 'id'>) =>
  customName || name || customEmail || email || `#${id}`;

export const displayUserEmail = ({ customEmail, email }: Pick<User, 'customEmail' | 'email'>) =>
  customEmail || email;
