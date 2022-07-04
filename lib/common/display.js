import { format } from 'date-fns';
import { dateFormat, formatDayRange, formatTime, formatTimestamp, WEEKDAYS } from './date';
import { COURSE_NAMES, COURSE_TYPES } from './courses';

export const displayCourseName = ({ type, dateStart, dateEnd }, capitalize = true) => [
  capitalize ? 'Séance' : 'séance',
  COURSE_NAMES[type].toLowerCase(),
  'du',
  formatDayRange(dateStart, dateEnd, false),
].join(' ');

export const displayCourseModelName = ({ type, weekday, timeStart, timeEnd, bundle }, capitalize = true) => [
  capitalize ? COURSE_NAMES[type] : COURSE_NAMES[type].toLowerCase(),
  'le',
  WEEKDAYS[weekday].toLowerCase(),
  'de',
  formatTime(timeStart),
  'à',
  formatTime(timeEnd),
].concat(bundle ? ['(lot)'] : []).join(' ');

export const displayDateOnly = date => format(new Date(date), dateFormat);

export const displayDatetime = date => formatTimestamp(date);

export const displayCourseType = type => COURSE_TYPES.find(({ id }) => id === type).title;

export const displayTimePeriod = (dateStart, dateEnd) => [
  format(new Date(dateStart), `HH'h'mm`),
  'à',
  format(new Date(dateEnd), `HH'h'mm`),
].join(' ');

export const displayUserName = ({ customName, name, customEmail, email, id }) => customName || name || customEmail || email || `#${id}`;

export const displayBundleName = ({ name }) => name;
