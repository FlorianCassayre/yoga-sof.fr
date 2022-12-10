import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import {
  cancelCourseRegistration,
  createCourseRegistrations,
  findCourseRegistrationEvents,
  findCourseRegistrations, updateCourseRegistrationAttendance
} from '../../services';
import { z } from 'zod';
import { courseRegistrationCreateSchema } from '../../../common/schemas/courseRegistration';

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
      findCourseRegistrations({ where: { courseId, userId, isUserCanceled: false }, include: { course: true, user: true } }),
  })
  .mutation('create', {
    input: courseRegistrationCreateSchema,
    resolve: async ({ input: { courses, users, notify } }) =>
      createCourseRegistrations({ data: { courses, users, notify } }),
  })
  .mutation('cancel', {
    input: z.strictObject({ id: z.number().int().min(0) }),
    resolve: async ({ input: { id } }) =>
      cancelCourseRegistration({ where: { id } }),
  })
  .mutation('attended', {
    input: z.strictObject({ id: z.number().int().min(0), attended: z.boolean().nullable() }),
    resolve: async ({ input: { id, attended } }) =>
      updateCourseRegistrationAttendance({ where: { id }, data: { attended } }),
  });