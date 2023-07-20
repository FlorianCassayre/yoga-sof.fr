import { z } from 'zod';
import {
  cancelCourse,
  createCourses,
  findCourse,
  findCoursesRelated, findUpdateCourse, findUpdateCourseNotes,
  updateCourse
} from '../../services';
import { courseCreateManySchema, courseUpdateNotesSchema } from '../../../common/schemas/course';
import { backofficeReadProcedure, backofficeWriteProcedure, router } from '../trpc';
import { prisma } from '../../prisma';

export const courseRouter = router({
  find: backofficeReadProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => findCourse({ where: { id } })),
  findUpdate: backofficeReadProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => findUpdateCourse({ where: { id } })),
  findUpdateNotes: backofficeReadProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => findUpdateCourseNotes({ where: { id } })),
  findRelated: backofficeReadProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => findCoursesRelated({ where: { id } })),
  findAll: backofficeReadProcedure
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
      return prisma.course.findMany({
        where: { ...(future === null ? {} : future ? { dateEnd: { gt: now } } : { dateEnd: { lte: now } }), isCanceled: canceled },
        include: { registrations: true },
      });
    }),
  /*.query('findAllPaginated', {
  input: schemaWithPagination,
  resolve: async ({ input: { pagination } }) => findCoursesPaginated({ pagination }),
  })*/
  createMany: backofficeWriteProcedure
    .input(courseCreateManySchema)
    .mutation(async ({ input: { type, timeStart, timeEnd, price, slots, dates } }) =>
      createCourses({ data: { type, price, slots, timeStart, timeEnd, dates } })),
  update: backofficeWriteProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
      slots: z.number().int().min(0),
      price: z.number().int().min(0),
    }))
    .mutation(async ({ input: { id, slots, price } }) =>
      await updateCourse({ where: { id }, data: { slots, price } })),
  updateNotes: backofficeWriteProcedure
    .input(courseUpdateNotesSchema)
    .mutation(async ({ input: { id, notes } }) => {
      return updateCourse({ where: { id }, data: { notes } });
    }),
  cancel: backofficeWriteProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
      cancelationReason: z.string().nullable(),
    }))
    .mutation(async ({ input: { id, cancelationReason } }) =>
      await cancelCourse({ where: { id }, data: { cancelationReason } })),
});
