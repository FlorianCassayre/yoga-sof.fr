import { Prisma } from '@prisma/client';

export const getUserStatistics = (user: Prisma.UserGetPayload<{ include: { courseRegistrations: { include: { course: true } }, accounts: true } }>) => {
  const { courseRegistrations } = user;

  const today = new Date();
  const notUserCanceled = courseRegistrations.filter(({ isUserCanceled, course: { isCanceled } }) => !isCanceled && !isUserCanceled);
  const coursesPast = notUserCanceled.filter(({ course: { isCanceled, dateEnd } }) => !isCanceled && new Date(dateEnd).getTime() <= today.getTime()).length;
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

export const getUserLatestMembership = (user: Prisma.UserGetPayload<{ include: { memberships: true } }>, date = new Date()) => {
  const { memberships } = user;

  const addOneDay = (d: Date) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + 1);
    return copy;
  };
  return memberships
    .filter(({ disabled }) => !disabled)
    .filter(({ dateStart, dateEnd }) => dateStart <= date && date < addOneDay(dateEnd))
    .sort(({ dateEnd: a }, { dateEnd: b }) => a < b ? 1 : -1)[0];
};
