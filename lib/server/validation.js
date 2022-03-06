import { HttpError } from '@premieroctet/next-crud';
import { parsedTimeToMinutes, parseTime } from '../common';

export const validateData = (resourceType, routeType, payload) => {
  if (resourceType === 'courseModels') {
    if (payload.weekday != null) {
      if (!(payload.weekday >= 0 && payload.weekday < 7)) {
        throw new HttpError(400, 'invalid week day');
      }
    }

    if (payload.timeStart != null && payload.timeEnd != null) {
      const start = parseTime(payload.timeStart);
      const end = parseTime(payload.timeEnd);
      if (start === null || end === null) {
        throw new HttpError(400, 'invalid time format');
      }
      if (parsedTimeToMinutes(start) >= parsedTimeToMinutes(end)) {
        throw new HttpError(400, 'invalid time range');
      }
    }
  }
};
