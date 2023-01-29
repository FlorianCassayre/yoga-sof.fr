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
import { adminProcedure, router } from '../trpc';

const selectorSchema = z.strictObject({
  courseId: z.number().int().min(0).optional(),
  userId: z.number().int().min(0).optional(),
  attended: z.boolean().optional(),
});

export const courseRegistrationRouter = router({
  findAll: adminProcedure
    .query(async () => findCourseRegistrations({ include: { user: true, course: true } })),
  findAllEvents: adminProcedure
    .input(selectorSchema)
    .query(async ({ input: { courseId, userId, attended } }) =>
      findCourseRegistrationEvents({ where: { courseId, userId, attended }, include: { course: courseId === undefined, user: userId === undefined } })),
  findAllActive: adminProcedure
    .input(selectorSchema)
    .query(async ({ input: { courseId, userId, attended } }) =>
      findCourseRegistrations({ where: { courseId, userId, isUserCanceled: false, attended }, include: { course: true, user: true } })),
  create: adminProcedure
    .input(courseRegistrationCreateSchema)
    .mutation(async ({ input: { courses, users, notify } }) =>
      createCourseRegistrations({ data: { courses, users, notify } })),
  cancel: adminProcedure
    .input(z.strictObject({ id: z.number().int().min(0) }))
    .mutation(async ({ input: { id } }) =>
      cancelCourseRegistration({ where: { id } })),
  attended: adminProcedure
    .input(z.strictObject({ id: z.number().int().min(0), attended: z.boolean().nullable() }))
    .mutation(async ({ input: { id, attended } }) =>
      updateCourseRegistrationAttendance({ where: { id }, data: { attended } })),
});
