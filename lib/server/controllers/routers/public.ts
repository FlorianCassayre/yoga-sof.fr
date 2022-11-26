import * as trpc from '@trpc/server';
import { ContextUnprotected } from '../context';
import { findCourseModels, findCourses } from '../../services';
import { Prisma } from '@prisma/client';

export const publicRouter = trpc
  .router<ContextUnprotected>()
  .query('findAllModels', {
    resolve: async () =>
      findCourseModels({ select: { type: true, slots: true, price: true, weekday: true, timeStart: true, timeEnd: true } }),
  })
  .query('findAllFutureCourses', {
    resolve: async () => {
      const date = new Date();
      // TODO what is the problem with typing??
      const courses = await findCourses({ where: { dateStart: { gt: date }, isCanceled: false }, include: { registrations: true }, orderBy: { dateStart: 'asc' } }) as Prisma.CourseGetPayload<{ include: { registrations: true } }>[];
      return courses.map(({ id, type, slots, price, dateStart, dateEnd, registrations }) => ({
        id, type, slots, price, dateStart, dateEnd,
        registrations: registrations.filter(({ isUserCanceled }) => !isUserCanceled).length,
      }));
    },
  });
