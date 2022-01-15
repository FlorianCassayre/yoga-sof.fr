import { SESSIONS_TYPES } from '../../components';
import { prisma } from '../../server';
import { createEvents } from 'ics';

const generateICS = registrations => {
  const timestampToDateArray = ts => {
    const date = new Date(ts);
    return [
      date.getFullYear(),
      date.getMonth(),
      date.getDay(),
      date.getHours(),
      date.getMinutes(),
    ];
  };

  const { error, value } = createEvents(registrations.map(
    ({ session: { type, date_start: dateStart, date_end: dateEnd } }) => ({
      title: SESSIONS_TYPES.filter(({ id }) => id === type)[0].title,
      start: timestampToDateArray(dateStart),
      end: timestampToDateArray(dateEnd),
      url: `${process.env.NEXTAUTH_URL}/mes-cours`,
      organizer: {
        name: 'Sophie Richaud-Cassayre',
      },
      // TODO many more fields to be explored
    }),
  ));

  if(error) {
    throw error;
  } else {
    return value;
  }
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const userId = parseInt(req.query.id), token = req.query.token;

    if(isNaN(userId) || !token) {
      res.status(400).json({ error: 'Bad Request: missing parameters' });
    } else {
      const userExists = !!(await prisma.users.count({
        where: {
          id: userId,
          public_access_token: token,
        },
      }));

      if(!userExists) {
        res.status(404).json({ error: 'Not Found: no calendar available for the given parameters' });
      } else {

        // For now we return all (non cancelled) events, however if this starts to get large we can trim it

        const registeredSessions = await prisma.registrations.findMany({
          where: {
            user_id: userId,
            is_user_canceled: false,
            session: {
              is_canceled: false,
            },
          },
          include: {
            session: true,
          }
        });

        const icsDataString = generateICS(registeredSessions);

        res.status(200);
        res.setHeader('Content-Type', 'text/calendar');
        res.write(icsDataString);
        res.end();
      }
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
