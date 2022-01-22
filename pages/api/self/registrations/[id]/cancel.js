import { getSession } from 'next-auth/react';
import { prisma } from '../../../../../server';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    if(!session) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const { user: { db_id: userId } } = session;

      const { id } = req.query;
      const registrationId = parseInt(id);

      if(!isNaN(registrationId)) {
        const result = await prisma.registrations.updateMany({
          where: {
            id: registrationId,
            user_id: userId,
            is_user_canceled: false,
            session: {
              date_start: {
                gt: new Date(),
              },
              is_canceled: false,
            },
          },
          data: {
            is_user_canceled: true,
            canceled_at: new Date(),
          },
        });

        if(result.count === 1) {
          res.status(200).json({});
        } else {
          res.status(400).json({ error: 'Bad Request' });
        }
      } else {
        res.status(400).json({ error: 'Bad Request: invalid session' });
      }
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
