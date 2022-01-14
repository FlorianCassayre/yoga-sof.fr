import { isSameDay } from 'date-fns';
import { getSession } from 'next-auth/react';
import { USER_TYPE_ADMIN } from '../../components';
import { prisma } from '../../server';

export default async function handler(req, res) {
  if (req.method === 'GET') {

    const [sessionModels, futureSessions] = await Promise.all([
      prisma.session_models.findMany(),
      prisma.sessions.findMany({
        select: {
          id: true,
          type: true,
          slots: true,
          price: true,
          date_start: true,
          date_end: true,
        },
        where: {
          AND: [
            {
              is_canceled: false,
            },
            {
              date_start: {
                gt: new Date,
              },
            },
          ],
        },
      }),
    ]);

    res.status(200).json({ schedule: sessionModels, sessions: futureSessions });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}