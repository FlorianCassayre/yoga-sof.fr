import { appLocaleTag } from './appLocale';
import { APP_TIMEZONE } from './timezone';

export const dateTimeFormatter = new Intl.DateTimeFormat(appLocaleTag, {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: APP_TIMEZONE,
});

const weekdayDateFormatter = new Intl.DateTimeFormat(appLocaleTag, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: APP_TIMEZONE,
});

const hourMinuteFormatter = new Intl.DateTimeFormat(appLocaleTag, {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: APP_TIMEZONE,
});

export const formatScheduleDate = (date: Date): string => {
  const formatted = weekdayDateFormatter.format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatScheduleTime = (date: Date): string =>
  hourMinuteFormatter.format(date).replace(':', 'h');
