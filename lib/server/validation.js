import { HttpError } from '@premieroctet/next-crud';
import { parsedTimeToMinutes, parseTime } from '../common';

export const validateData = (resourceType, routeType, payload) => {
  if (resourceType === 'session_models') {
    if (payload.weekday != null) {
      if (!(payload.weekday >= 0 && payload.weekday < 7)) {
        throw new HttpError(400, 'invalid week day');
      }
    }

    if (payload.time_start != null && payload.time_end != null) {
      const start = parseTime(payload.time_start),
        end = parseTime(payload.time_end);
      if (start === null || end === null) {
        throw new HttpError(400, 'invalid time format');
      }
      if (parsedTimeToMinutes(start) >= parsedTimeToMinutes(end)) {
        throw new HttpError(400, 'invalid time range');
      }
    }
  }
};
