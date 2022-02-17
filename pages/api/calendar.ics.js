import { SESSIONS_TYPES } from '../../lib/common';
import { schemaCalendarQuery } from '../../lib/common';
import { apiHandler } from '../../lib/server';
import { prisma } from '../../lib/server';
import { createEvents } from 'ics';

const generateICS = (registrations) => {
  const timestampToDateArray = (ts) => {
    const date = new Date(ts);
    return [date.getFullYear(), date.getMonth() + 1, date.getDay(), date.getHours(), date.getMinutes()];
  };

  const { error, value } = createEvents(
    registrations.map(({ session: { type, date_start: dateStart, date_end: dateEnd } }) => ({
      title: SESSIONS_TYPES.filter(({ id }) => id === type)[0].title,
      start: timestampToDateArray(dateStart),
      end: timestampToDateArray(dateEnd),
      url: `${process.env.NEXTAUTH_URL}/mes-inscriptions`,
      organizer: {
        name: 'Sophie Richaud-Cassayre',
      },
      // TODO many more fields to be explored
    }))
  );

  if (error) {
    throw error;
  } else {
    return value;
  }
};

export default async function handler(req, res) {
  await apiHandler({
    GET: {
      schemaQuery: schemaCalendarQuery,
      action: async (req, res, { reject, query: { id: userId, token } }) => {
        const userExists = !!(await prisma.users.count({
          where: {
            id: userId,
            public_access_token: token,
          },
        }));

        if (!userExists) {
          reject('Not Found: no calendar available for the given parameters', 404);
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
            },
          });

          const icsDataString = generateICS(registeredSessions);

          res.status(200);
          res.setHeader('Content-Type', 'text/calendar');
          res.write(icsDataString);
          res.end();
        }
      },
    },
  })(req, res);
}
