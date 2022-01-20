import { isSameDay, isValid } from 'date-fns';
import { getSession } from 'next-auth/react';
import { USER_TYPE_ADMIN } from '../../../../components';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    if(!session) {
      res.status(401).json({ error: 'Unauthorized' });
    } else if(session.userType === USER_TYPE_ADMIN) {
      const sessionId = parseInt(req.query.id);

      if(!isNaN(sessionId)) {
        const result = await prisma.sessions.updateMany({
          where: {
            id: sessionId,
            is_canceled: false,
            date_start: {
              gt: new Date(),
            }
          },
          data: {
            is_canceled: true,
          },
        });

        // TODO send email to all participants (by retrieving the updated rows)

        if(result.count === 1) {
          res.status(200).json({});
        } else {
          res.status(400).json({ error: 'Bad request: impossible to cancel this session' });
        }
      } else {
        res.status(400).json({ error: 'Bad request: invalid id' });
      }
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
