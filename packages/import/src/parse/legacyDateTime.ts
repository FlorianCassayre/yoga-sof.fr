import { TZDate } from '@date-fns/tz';
import { APP_TIMEZONE } from '@yoga-sof/core';

import type { MysqlValue } from './parseMysqlDump';

// The legacy server ran with a fixed '+02:00' time zone: the dump stores the Paris wall clock
// minus two hours, regardless of DST. Rebuild the real instant from the shifted wall clock.
const LEGACY_OFFSET_HOURS = 2;

const parseLegacyDateTime = (value: MysqlValue): Date | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/.exec(value);
  if (!match) {
    throw new Error(`Unparseable datetime '${value}'.`);
  }
  const [
    ,
    year = '',
    month = '',
    day = '',
    hours = '',
    minutes = '',
    seconds = '',
    milliseconds = '',
  ] = match;
  return new Date(Date.UTC(+year, +month - 1, +day, +hours, +minutes, +seconds, +milliseconds));
};

const parseLegacyCourseInstant = (value: MysqlValue): Date => {
  const utc = parseLegacyDateTime(value)!;
  const wall = new Date(utc.getTime() + LEGACY_OFFSET_HOURS * 3_600_000);
  return new TZDate(
    wall.getUTCFullYear(),
    wall.getUTCMonth(),
    wall.getUTCDate(),
    wall.getUTCHours(),
    wall.getUTCMinutes(),
    wall.getUTCSeconds(),
    wall.getUTCMilliseconds(),
    APP_TIMEZONE,
  );
};

export { parseLegacyCourseInstant, parseLegacyDateTime };
