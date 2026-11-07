import { TZDate } from '@date-fns/tz';
import { APP_TIMEZONE } from '@yoga-sof/core';
import { addDays, endOfMonth, startOfDay, startOfMonth, startOfWeek } from 'date-fns';

import type { CalendarView } from './CalendarView';

// Mirrors the scheduler's agenda view: a fixed horizon of days from the visible date.
const AGENDA_DAYS = 12;

export const courseCalendarRange = (
  view: CalendarView,
  visibleDate: Date,
): { start: Date; end: Date } => {
  const date = new TZDate(visibleDate, APP_TIMEZONE);
  const day = startOfDay(date);

  switch (view) {
    case 'day':
      return { start: day, end: addDays(day, 1) };
    case 'agenda':
      return { start: day, end: addDays(day, AGENDA_DAYS) };
    case 'month': {
      const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
      const end = startOfWeek(endOfMonth(date), { weekStartsOn: 1 });

      return { start, end: addDays(end, 7) };
    }
    case 'week': {
      const start = startOfWeek(date, { weekStartsOn: 1 });

      return { start, end: addDays(start, 7) };
    }
  }
};
