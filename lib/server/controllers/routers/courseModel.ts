import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import { createCourseModel, findCourseModels, updateCourseModel } from '../../services';
import { formatTimeHHhMM, WeekdayNames } from '../../../common/newDate';
import { CourseType } from '@prisma/client';

export const courseModelSchema = z.object({
  type: z.nativeEnum(CourseType),
  weekday: z.number().int().min(0).max(WeekdayNames.length - 1),
  timeStart: z.date().transform(date => formatTimeHHhMM(date)),
  timeEnd: z.date().transform(date => formatTimeHHhMM(date)),
  slots: z.number().int().min(1).max(99),
  price: z.number().int().min(0).max(99),
  bundle: z.boolean(),
});

export const courseModelIdSchema = courseModelSchema.extend({
  id: z.number().int().min(0),
});

export const courseModelRouter = trpc
  .router<ContextProtected>()
  .query('getAll', {
    resolve: async () => findCourseModels(),
  })
  .mutation('create', {
    input: courseModelSchema,
    resolve: async ({ input }) => createCourseModel({ data: input }),
  })
  .mutation('update', {
    input: courseModelIdSchema,
    resolve: async ({ input: { id, ...data } }) => updateCourseModel({ where: { id }, data }),
  });
