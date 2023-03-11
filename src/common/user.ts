import { Prisma } from '@prisma/client';

const sum = (array: number[]): number => array.reduce((a, b) => a + b, 0);

export const getUserStatistics = (user: Prisma.UserGetPayload<{ include: { courseRegistrations: { include: { course: true } }, accounts: true, transactions: true } }>) => {
  const { courseRegistrations } = user;

  const today = new Date();
  const notCanceled = courseRegistrations.filter(({ isUserCanceled, course: { isCanceled } }) => !isCanceled && !isUserCanceled);
  const coursesPast = notCanceled.filter(({ course: { isCanceled, dateEnd } }) => !isCanceled && new Date(dateEnd).getTime() <= today.getTime()).length;
  const coursesFuture = notCanceled.length - coursesPast;
  const coursesWithLastUnregistrations = new Set<number>();
  courseRegistrations.forEach(({ courseId }) => coursesWithLastUnregistrations.add(courseId));
  notCanceled.forEach(({ courseId }) => coursesWithLastUnregistrations.delete(courseId));
  const courseUnregistrations = coursesWithLastUnregistrations.size;
  const courseAbsences = notCanceled.filter(({ attended }) => attended === false).length;
  const totalTransactionsAmount = sum(user.transactions.map(({ amount }) => amount));
  const totalCoursesAmount = sum(user.courseRegistrations.filter(({ isUserCanceled }) => !isUserCanceled).map(({ course }) => course.price));
  return {
    coursesPast,
    coursesFuture,
    courseUnregistrations,
    courseAbsences,
    totalTransactionsAmount,
    totalCoursesAmount,
  };
};
