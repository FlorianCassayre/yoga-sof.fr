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
});

export const courseRegistrationRouter = router({
  courseRegistrationFindAll: adminProcedure
    .query(async () => findCourseRegistrations({ include: { user: true, course: true } })),
  courseRegistrationFindAllEvents: adminProcedure
    .input(selectorSchema)
    .query(async ({ input: { courseId, userId } }) =>
      findCourseRegistrationEvents({ where: { courseId, userId }, include: { course: courseId === undefined, user: userId === undefined } })),
  courseRegistrationFindAllActive: adminProcedure
    .input(selectorSchema)
    .query(async ({ input: { courseId, userId } }) =>
      findCourseRegistrations({ where: { courseId, userId, isUserCanceled: false }, include: { course: true, user: true } })),
  courseRegistrationCreate: adminProcedure
    .input(courseRegistrationCreateSchema)
    .mutation(async ({ input: { courses, users, notify } }) =>
      createCourseRegistrations({ data: { courses, users, notify } })),
  courseRegistrationCancel: adminProcedure
    .input(z.strictObject({ id: z.number().int().min(0) }))
    .mutation(async ({ input: { id } }) =>
      cancelCourseRegistration({ where: { id } })),
  courseRegistrationAttended: adminProcedure
    .input(z.strictObject({ id: z.number().int().min(0), attended: z.boolean().nullable() }))
    .mutation(async ({ input: { id, attended } }) =>
      updateCourseRegistrationAttendance({ where: { id }, data: { attended } })),
});
