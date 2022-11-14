import { format } from 'date-fns';
import { createEvents, DateArray, EventAttributes } from 'ics';
import { Course, CourseRegistration, Prisma } from '@prisma/client';
import { CourseTypeNames } from '../../common/newCourse';
import { CourseTypeLocation, EMAIL_CONTACT } from '../../common/newConfig';
import { formatDateDDsMMsYYYY, formatTimeHHhMM } from '../../common/newDate';

const uidFor = (type: string, id: number) => `${type}#${id}@yoga-sof.fr`;

const timestampToDateArray = (ts: Date | string): DateArray => {
  const date = new Date(ts);
  return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()];
};

const getCommonCourseFields = ({ type, dateStart, dateEnd }: Pick<Course, 'type' | 'dateStart' | 'dateEnd'>) => {
  const courseName = CourseTypeNames[type];
  const location = CourseTypeLocation[type];
  return {
    title: `Séance de ${courseName}` as string,
    description: `Séance du ${formatDateDDsMMsYYYY(dateStart)} de ${formatTimeHHhMM(dateStart)} à ${formatTimeHHhMM(dateEnd)} (${courseName}).` as string,
    start: timestampToDateArray(dateStart),
    end: timestampToDateArray(dateEnd),
    startInputType: 'local',
    startOutputType: 'utc',
    endInputType: 'local',
    endOutputType: 'utc',
    organizer: {
      name: 'Sophie Richaud-Cassayre' as string,
      email: EMAIL_CONTACT,
    },
    location: location.name,
    geo: {
      lat: location.coordinates.latitude,
      lon: location.coordinates.longitude,
    },
  } as const;
};

const generateCoachICS = (courses: Prisma.CourseGetPayload<{ include: { registrations: { include: { user: true } } } }>[]): string => {
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
          name: customName || name || '?',
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
    return value as string;
  }
};

const generateParticipantICS = (registrations: Prisma.CourseRegistrationGetPayload<{ include: { course: true } }>[]) => {
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
