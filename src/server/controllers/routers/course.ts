import { z } from 'zod';
import {
  cancelCourse,
  createCourses,
  findCourse,
  findCourses,
  updateCourse
} from '../../services';
import { courseCreateManySchema, courseUpdateNotesSchema } from '../../../common/schemas/course';
import { adminProcedure, router } from '../trpc';

export const courseRouter = router({
  courseFind: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return findCourse({ where: { id }, include: { registrations: true } });
    }),
  courseFindUpdate: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return findCourse({ where: { id }, select: { id: true, slots: true, price: true } });
    }),
  courseFindUpdateNotes: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      return findCourse({ where: { id }, select: { id: true, notes: true } });
    }),
  courseFindAll: adminProcedure
    .input(z.strictObject({
      future: z.boolean().nullable(),
      canceled: z.boolean(),
    }))
    .query(async ({ input: { future, canceled } }) => {
      const now = new Date();
      return findCourses({
        where: { ...(future === null ? {} : future ? { dateEnd: { gt: now } } : { dateEnd: { lte: now } }), isCanceled: canceled },
        include: { registrations: true },
      });
    }),
  /*.query('findAllPaginated', {
  input: schemaWithPagination,
  resolve: async ({ input: { pagination } }) => findCoursesPaginated({ pagination }),
  })*/
  courseCreateMany: adminProcedure
    .input(courseCreateManySchema)
    .mutation(async ({ input: { type, timeStart, timeEnd, price, slots, dates } }) =>
      createCourses({ data: { type, price, slots, timeStart, timeEnd, dates } })),
  courseUpdate: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
      slots: z.number().int().min(0),
      price: z.number().int().min(0),
    }))
    .mutation(async ({ input: { id, slots, price } }) =>
      await updateCourse({ where: { id }, data: { slots, price } })),
  courseUpdateNotes: adminProcedure
    .input(courseUpdateNotesSchema)
    .mutation(async ({ input: { id, notes } }) => {
      return updateCourse({ where: { id }, data: { notes } });
    }),
  courseCancel: adminProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
      cancelationReason: z.string().nullable(),
    }))
    .mutation(async ({ input: { id, cancelationReason } }) =>
      await cancelCourse({ where: { id }, data: { cancelationReason } })),
});
