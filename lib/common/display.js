import { format } from 'date-fns';
import { dateFormat, formatDayRange, formatTime, formatTimestamp, WEEKDAYS } from './date';
import { SESSIONS_NAMES, SESSIONS_TYPES } from './sessions';

export const displaySessionName = ({ type, date_start: dateStart, date_end: dateEnd }, capitalize = true) => [
  capitalize ? 'Séance' : 'séance',
  SESSIONS_NAMES[type].toLowerCase(),
  'du',
  formatDayRange(dateStart, dateEnd),
].join(' ');

export const displaySessionModelName = ({ type, weekday, time_start: timeStart, time_end: timeEnd }, capitalize = true) => [
  capitalize ? SESSIONS_NAMES[type] : SESSIONS_NAMES[type].toLowerCase(),
  'le',
  WEEKDAYS[weekday].toLowerCase(),
  'de',
  formatTime(timeStart),
  'à',
  formatTime(timeEnd),
].join(' ');

export const displayDateOnly = date => format(new Date(date), dateFormat);

export const displayDatetime = date => formatTimestamp(date);

export const displaySessionType = type => SESSIONS_TYPES.find(({ id }) => id === type).title;

export const displayTimePeriod = (dateStart, dateEnd) => [
  format(new Date(dateStart), "HH'h'mm"),
  'à',
  format(new Date(dateEnd), "HH'h'mm"),
].join(' ');
