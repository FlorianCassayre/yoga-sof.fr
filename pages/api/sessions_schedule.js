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
          registrations: {
            where: {
              is_user_canceled: false,
            },
            select: {
              is_user_canceled: true,
            },
          },
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

    // Convert array into count
    // Follow https://github.com/prisma/prisma/issues/6570 for better alternative

    res.status(200).json({ schedule: sessionModels, sessions: futureSessions.map(({ registrations, ...obj }) => ({ ...obj, registrations: registrations.length })) });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
