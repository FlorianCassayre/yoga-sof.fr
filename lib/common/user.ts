import { Prisma } from '@prisma/client';

export const getUserStatistics = (user: Prisma.UserGetPayload<{ include: { courseRegistrations: { include: { course: true } }, accounts: true } }>) => {
  const { courseRegistrations } = user;

  const today = new Date();
  const notUserCanceled = courseRegistrations.filter(({ isUserCanceled }) => !isUserCanceled);
  const coursesPast = notUserCanceled.filter(({ course: { dateEnd } }) => new Date(dateEnd).getTime() <= today.getTime()).length;
  const coursesFuture = notUserCanceled.length - coursesPast;
  const coursesWithLastUnregistrations = new Set<number>();
  courseRegistrations.forEach(({ courseId }) => coursesWithLastUnregistrations.add(courseId));
  notUserCanceled.forEach(({ courseId }) => coursesWithLastUnregistrations.delete(courseId));
  const courseUnregistrations = coursesWithLastUnregistrations.size;
  const courseAbsences = notUserCanceled.filter(({ attended }) => attended === false).length;
  return {
    coursesPast,
    coursesFuture,
    courseUnregistrations,
    courseAbsences,
  };
};
