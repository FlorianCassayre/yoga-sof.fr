import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { createCourseRegistrations, findCourseRegistrationEvents, findCourseRegistrations } from '../../services';
import { z } from 'zod';
import { courseRegistrationCreateSchema } from '../../../common/newSchemas/courseRegistration';

const selectorSchema = z.strictObject({
  courseId: z.number().int().min(0).optional(),
  userId: z.number().int().min(0).optional(),
});

export const courseRegistrationRouter = trpc
  .router<ContextProtected>()
  .query('findAll', {
    resolve: async () => findCourseRegistrations({ include: { user: true, course: true } }),
  })
  .query('findAllEvents', {
    input: selectorSchema,
    resolve: async ({ input: { courseId, userId } }) =>
      findCourseRegistrationEvents({ where: { courseId, userId }, include: { course: courseId === undefined, user: userId === undefined } }),
  })
  .query('findAllActive', {
    input: selectorSchema,
    resolve: async ({ input: { courseId, userId } }) =>
      findCourseRegistrations({ where: { courseId, userId, isUserCanceled: false }, include: { course: courseId === undefined, user: userId === undefined } }),
  })
  .mutation('create', {
    input: courseRegistrationCreateSchema,
    resolve: async ({ input: { courses, users, notify } }) =>
      createCourseRegistrations({ data: { courses, users, notify } }),
  });
