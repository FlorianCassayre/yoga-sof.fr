import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import {
  cancelCourse,
  createCourses,
  findCourse,
  findCourses,
  findCoursesPaginated,
  updateCourse
} from '../../services';
import { schemaWithPagination } from '../schemas';
import { courseCreateManySchema, courseUpdateNotesSchema } from '../../../common/newSchemas/course';
import { prisma } from '../../prisma';
import { colonTimeToParts } from '../../../common/date';

export const courseRouter = trpc
  .router<ContextProtected>()
  .query('find', {
    input: z.strictObject({
      id: z.number().int().min(0),
    }),
    resolve: async ({ input: { id } }) => {
      return findCourse({ where: { id }, include: { registrations: true } });
    },
  })
  .query('findUpdate', {
    input: z.strictObject({
      id: z.number().int().min(0),
    }),
    resolve: async ({ input: { id } }) => {
      return findCourse({ where: { id }, select: { id: true, slots: true, price: true } });
    },
  })
  .query('findUpdateNotes', {
    input: z.strictObject({
      id: z.number().int().min(0),
    }),
    resolve: async ({ input: { id } }) => {
      return findCourse({ where: { id }, select: { id: true, notes: true } });
    },
  })
  .query('findAll', {
    input: z.strictObject({
      future: z.boolean(),
    }),
    resolve: async ({ input: { future } }) => {
      const whereFuture = {
        dateEnd: {
          gt: new Date(),
        },
        isCanceled: false,
      };

      return findCourses({
        where: future ? whereFuture : { NOT: whereFuture },
        include: { registrations: true },
      })
    },
  })
  /*.query('findAllPaginated', {
    input: schemaWithPagination,
    resolve: async ({ input: { pagination } }) => findCoursesPaginated({ pagination }),
  })*/
  .mutation('createMany', {
    input: courseCreateManySchema,
    resolve: async ({ input: { type, timeStart, timeEnd, price, slots, dates } }) =>
      createCourses({ data: { type, price, slots, timeStart, timeEnd, dates } }),
  })
  .mutation('update', {
    input: z.strictObject({
      id: z.number().int().min(0),
      slots: z.number().int().min(0),
      price: z.number().int().min(0),
    }),
    resolve: async ({ input: { id, slots, price } }) =>
      await updateCourse({ where: { id }, data: { slots, price } }),
  })
  .mutation('updateNotes', {
    input: courseUpdateNotesSchema,
    resolve: async ({ input: { id, notes } }) => {
      return updateCourse({ where: { id }, data: { notes } });
    },
  })
  .mutation('cancel', {
    input: z.strictObject({
      id: z.number().int().min(0),
      cancelationReason: z.string().nullable(),
    }),
    resolve: async ({ input: { id, cancelationReason } }) =>
      await cancelCourse({ where: { id }, data: { cancelationReason } }),
  });
