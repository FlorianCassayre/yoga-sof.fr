import { getSession } from 'next-auth/react';
import { prisma } from '../../../server';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const session = await getSession({ req });
    if(!session) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const { user: { db_id: id } } = session;

      const result = await prisma.registrations.findMany({
        where: {
          user_id: id,
        },
        select: {
          id: true,
          is_user_canceled: true,
          created_at: true,
          canceled_at: true,
          session: {
            select: {
              id: true,
              type: true,
              slots: true,
              price: true,
              date_start: true,
              date_end: true,
            },
          },
        },
      });

      res.status(200).json(result);
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
