import { z } from 'zod';
import {
  cancelCourse,
  createCourses,
  findCourse,
  findCourses, findCoursesRelated,
  updateCourse
} from '../../services';
import { courseCreateManySchema, courseUpdateNotesSchema } from '../../../common/schemas/course';
import { adminProcedure, router } from '../trpc';

export const courseRouter = router({
  find: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return findCourse({ where: { id }, include: { registrations: true } });
    }),
  findUpdate: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return findCourse({ where: { id }, select: { id: true, slots: true, price: true } });
    }),
  findUpdateNotes: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return findCourse({ where: { id }, select: { id: true, notes: true } });
    }),
  findRelated: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => findCoursesRelated({ where: { id } })),
  findAll: adminProcedure
    .input(z.strictObject({
      future: z.boolean().nullable(),
      extended: z.boolean().nullable(),
      canceled: z.boolean(),
    }))
    .query(async ({ input: { future, canceled, extended } }) => {
      const now = new Date();
      if (extended) {
        now.setDate(now.getDate() + (future ? -1 : 1));
      }
      return findCourses({
        where: { ...(future === null ? {} : future ? { dateEnd: { gt: now } } : { dateEnd: { lte: now } }), isCanceled: canceled },
        include: { registrations: true },
      });
    }),
  /*.query('findAllPaginated', {
  input: schemaWithPagination,
  resolve: async ({ input: { pagination } }) => findCoursesPaginated({ pagination }),
  })*/
  createMany: adminProcedure
    .input(courseCreateManySchema)
    .mutation(async ({ input: { type, timeStart, timeEnd, price, slots, dates } }) =>
      createCourses({ data: { type, price, slots, timeStart, timeEnd, dates } })),
  update: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
      slots: z.number().int().min(0),
      price: z.number().int().min(0),
    }))
    .mutation(async ({ input: { id, slots, price } }) =>
      await updateCourse({ where: { id }, data: { slots, price } })),
  updateNotes: adminProcedure
    .input(courseUpdateNotesSchema)
    .mutation(async ({ input: { id, notes } }) => {
      return updateCourse({ where: { id }, data: { notes } });
    }),
  cancel: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
      cancelationReason: z.string().nullable(),
    }))
    .mutation(async ({ input: { id, cancelationReason } }) =>
      await cancelCourse({ where: { id }, data: { cancelationReason } })),
});
