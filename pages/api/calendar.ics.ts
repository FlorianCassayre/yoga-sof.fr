import { calendarFindSchema } from '../../lib/common/newSchemas/calendar';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCalendarForRequest } from '../../lib/server/services/calendar';
import { ServiceError, ServiceErrorCode } from '../../lib/server/services/helpers/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const result = calendarFindSchema.safeParse(req.query);

  if (result.success) {
    const { token, coach } = result.data;
    try {
      const icsDataString = await getCalendarForRequest(token, !!coach);
      res.status(200);
      res.setHeader('Content-Type', 'text/calendar');
      res.write(icsDataString);
    } catch (error) {
      if (error instanceof ServiceError) {
        if (error.code === ServiceErrorCode.CalendarNotFound) {
          res.status(404);
        } else if (error.code === ServiceErrorCode.CalendarNotAllowed) {
          res.status(403);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  } else {
    res.status(400);
  }

  res.end();
}