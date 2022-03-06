import { createEvents } from 'ics';
import { schemaCalendarQuery, SESSIONS_NAMES } from '../../lib/common';
import { apiHandler, prisma } from '../../lib/server';

const generateICS = registrations => {
  const timestampToDateArray = ts => {
    const date = new Date(ts);
    return [date.getFullYear(), date.getMonth() + 1, date.getDay(), date.getHours(), date.getMinutes()];
  };

  const { error, value } = createEvents(
    registrations.map(({ course: { type, dateStart, dateEnd } }) => ({
      title: SESSIONS_NAMES[type],
      start: timestampToDateArray(dateStart),
      end: timestampToDateArray(dateEnd),
      url: `${process.env.NEXTAUTH_URL}/mes-inscriptions`,
      organizer: { name: 'Sophie Richaud-Cassayre' },
      // TODO many more fields to be explored
    })),
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
      action: async ({ reject, query: { id: userId, token } }) => {
        const userExists = !!(await prisma.user.count({
          where: {
            id: userId,
            publicAccessToken: token,
          },
        }));

        if (!userExists) {
          reject('Not Found: no calendar available for the given parameters', 404);
        } else {
          // For now we return all (non cancelled) events, however if this starts to get large we can trim it

          const registeredCourses = await prisma.courseRegistration.findMany({
            where: {
              userId,
              isUserCanceled: false,
              course: { isCanceled: false },
            },
            include: { course: true },
          });

          const icsDataString = generateICS(registeredCourses);

          res.status(200);
          res.setHeader('Content-Type', 'text/calendar');
          res.write(icsDataString);
          res.end();
        }
      },
    },
  })(req, res);
}
