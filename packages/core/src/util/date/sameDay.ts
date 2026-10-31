import { TZDate } from '@date-fns/tz';

import { APP_TIMEZONE } from './timezone';

export const sameDay = (a: Date, b: Date): boolean => {
  const start = new TZDate(a, APP_TIMEZONE);
  const end = new TZDate(b, APP_TIMEZONE);

  return (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()
  );
};
