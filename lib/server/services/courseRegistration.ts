import { CourseRegistration, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

const registrationsToEvent = <T extends CourseRegistration>(registrations: T[]) =>
  registrations.flatMap(registration => [{
    isEventTypeUserCanceled: false,
    date: registration.createdAt,
    registration,
  }, ...(registration.isUserCanceled ? [{
    isEventTypeUserCanceled: true,
    date: registration.canceledAt as Date,
    registration,
  }] : [])]).sort(({ date: date1 }, { date: date2 }) => date2.getTime() - date1.getTime());

export const findCourseRegistrations = async <Where extends Prisma.CourseRegistrationWhereInput, Select extends Prisma.CourseRegistrationSelect, Include extends Prisma.CourseRegistrationInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseRegistrationOrderByWithRelationInput>>(args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
  prisma.courseRegistration.findMany(args);

export const findCourseRegistrationEvents = async <Where extends Pick<Prisma.CourseRegistrationWhereInput, 'courseId' | 'userId'>, Select extends Prisma.CourseRegistrationSelect, Include extends Prisma.CourseRegistrationInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseRegistrationOrderByWithRelationInput>>(args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
 registrationsToEvent(await findCourseRegistrations(args))
