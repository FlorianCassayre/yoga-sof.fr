import { format } from 'date-fns';
import { createEvents } from 'ics';
import { schemaCalendarQuery, COURSE_NAMES, COURSE_TYPE_LOCATION, EMAIL_CONTACT, dateFormat, formatTimeRange } from '../../lib/common';
import { apiHandler, prisma } from '../../lib/server';

const uidFor = (type, id) => `${type}#${id}@yoga-sof.fr`;

const timestampToDateArray = ts => {
  const date = new Date(ts);
  return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()];
};

const getCommonCourseFields = ({ type, dateStart, dateEnd }) => {
  const courseName = COURSE_NAMES[type];
  const location = COURSE_TYPE_LOCATION[type];
  return {
    title: `Séance de ${courseName}`,
    description: `Séance du ${format(new Date(dateStart), dateFormat)} de ${formatTimeRange(dateStart, dateEnd)} (${courseName}).`,
    start: timestampToDateArray(dateStart),
    end: timestampToDateArray(dateEnd),
    startInputType: 'local',
    startOutputType: 'local',
    endInputType: 'local',
    endOutputType: 'local',
    organizer: {
      name: 'Sophie Richaud-Cassayre',
      email: EMAIL_CONTACT,
    },
    location: location.name,
    geo: {
      lat: location.coordinates.latitude,
      lon: location.coordinates.longitude,
    },
  };
};

const generateCoachICS = courses => {
  const { error, value } = createEvents(
    courses.map(course => {
      const { id: courseId, registrations, slots, price, notes } = course;
      const nonCanceledRegistrations = registrations.filter(({ isUserCanceled }) => !isUserCanceled);
      const common = getCommonCourseFields(course);
      const url = `${process.env.NEXTAUTH_URL}/administration/seances/planning/${courseId}`;
      const gauge = `${nonCanceledRegistrations.length} / ${slots}`;
      return {
        ...common,
        title: `${common.title} (${gauge})`,
        uid: uidFor('course-coach', courseId),
        description: `${gauge} participant(s) inscrit(s). Prix unitaire de ${price} €.${notes ? `\n${notes}` : ''}\n\n${url}`,
        url,
        attendees: nonCanceledRegistrations.map(({ user: { id: userId, /* customEmail, */ customName, /* email, */ name } }) => ({
          name: customName || name,
          // email: customEmail || email, // We don't include the email to avoid sending them a message by accident!
          dir: `${process.env.NEXTAUTH_URL}/administration/utilisateurs/${userId}`,
          rsvp: false,
          partstat: 'ACCEPTED',
        })),
      };
    }),
  );

  if (error) {
    throw error;
  } else {
    return value;
  }
};

const generateParticipantICS = registrations => {
  const { error, value } = createEvents(
    registrations.map(({ course }) => {
      const common = getCommonCourseFields(course);
      const url = `${process.env.NEXTAUTH_URL}/mes-inscriptions`;
      return {
        ...common,
        uid: uidFor('course', course.id),
        description: `${common.description}\n\n${url}`,
        url,
      };
    }),
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
      action: async ({ reject, query: { /* id: userId, */ token, coach } }) => {
        // `coach` is either the empty string or undefined
        const isCoach = coach !== undefined;

        const users = await prisma.user.findMany({
          where: {
            publicAccessToken: token,
          },
        });
        const userExists = users.length === 1;

        if (!userExists) {
          reject('Not Found: no calendar available for the given parameters', 404);
        } else {
          const user = users[0];
          const userId = user.id;

          let icsDataString;
          if (isCoach) {
            const isEmailAdminWhitelisted = !!(await prisma.adminWhitelist.count({
              where: {
                email: user.email,
              },
            }));

            if (isEmailAdminWhitelisted) {
              // For now we return all (non canceled) events, however if this starts to get large we can trim it

              const nonCanceledCourses = await prisma.course.findMany({
                where: {
                  isCanceled: false,
                },
                include: { registrations: { include: { user: true } } },
              });

              icsDataString = generateCoachICS(nonCanceledCourses);
            } else {
              reject('Forbidden: this account is not allowed to access this calendar', 403);
              return;
            }
          } else {
            // Same here, all non canceled events appear (including past ones)

            const nonCanceledUserRegistrations = await prisma.courseRegistration.findMany({
              where: {
                userId,
                isUserCanceled: false,
                course: { isCanceled: false },
              },
              include: { course: true },
            });

            icsDataString = generateParticipantICS(nonCanceledUserRegistrations);
          }

          res.status(200);
          res.setHeader('Content-Type', 'text/calendar');
          res.write(icsDataString);
          res.end();
        }
      },
    },
  })(req, res);
}
