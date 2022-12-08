import { findCourseModels, findCourses } from '../../services';
import { Prisma } from '@prisma/client';
import { procedure, router } from '../trpc';

export const publicRouter = router({
  publicFindAllModels: procedure
    .query(async () =>
      findCourseModels({ select: { type: true, slots: true, price: true, weekday: true, timeStart: true, timeEnd: true } })),
  publicFindAllFutureCourses: procedure
    .query(async () => {
      const date = new Date();
      // TODO what is the problem with typing??
      const courses = await findCourses({ where: { dateStart: { gt: date }, isCanceled: false }, include: { registrations: true }, orderBy: { dateStart: 'asc' } }) as Prisma.CourseGetPayload<{ include: { registrations: true } }>[];
      return courses.map(({ id, type, slots, price, dateStart, dateEnd, registrations }) => ({
        id, type, slots, price, dateStart, dateEnd,
        registrations: registrations.filter(({ isUserCanceled }) => !isUserCanceled).length,
      }));
    }),
});
