import { isSameDay, isValid } from 'date-fns';
import { getSession } from 'next-auth/react';
import { USER_TYPE_ADMIN } from '../../components';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    if(!session) {
      res.status(401).json({ error: 'Unauthorized' });
    } else if(session.userType === USER_TYPE_ADMIN) {

      const { type, spots, dates } = req.body;
      if(!dates || !dates.length) {
        res.status(400).json({ error: 'Bad Request: must schedule at least one date' });
        return;
      }
      for(const e of dates) {
        if(!e || e.length !== 2) {
          res.status(400).json({ error: 'Bad Request: invalid range shape' });
          return;
        }
        if(e[0] >= e[1] || !isSameDay(new Date(e[0]), new Date(e[1]))) {
          res.status(400).json({ error: 'Bad Request: invalid date range' });
          return;
        }
      }

      // Create the records
      const records = dates.map(([start, end]) => ({
        type,
        spots,
        date_start: new Date(start),
        date_end: new Date(end),
      }));
      await prisma.sessions.createMany({
        data: records,
      });

      res.status(200).json({});
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
