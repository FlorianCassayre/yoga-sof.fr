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
import { prisma, transactionOptions } from '../../prisma';

const selectorSchema = z.strictObject({
  courseId: z.number().int().min(0).optional(),
  userId: z.number().int().min(0).optional(),
  attended: z.boolean().optional(),
});

export const courseRegistrationRouter = router({
  findAll: adminProcedure
    .query(async () => prisma.$transaction(async (prisma) => findCourseRegistrations(prisma, { include: { user: true, course: true } }), transactionOptions)),
  findAllEvents: adminProcedure
    .input(selectorSchema)
    .query(async ({ input: { courseId, userId, attended } }) =>
      prisma.$transaction(async (prisma) => findCourseRegistrationEvents(prisma, { where: { courseId, userId, attended }, include: { course: courseId === undefined, user: userId === undefined } }), transactionOptions)),
  findAllActive: adminProcedure
    .input(selectorSchema)
    .query(async ({ input: { courseId, userId, attended } }) =>
        prisma.$transaction(async (prisma) => findCourseRegistrations(prisma, { where: { courseId, userId, isUserCanceled: false, attended }, include: { course: true, user: { include: { memberships: true } } } }), transactionOptions)),
  create: adminProcedure
    .input(courseRegistrationCreateSchema)
    .mutation(async ({ input: { courses, users, notify } }) => {
        const [result, sendMailsCallback] = await prisma.$transaction(async (prisma) => createCourseRegistrations(prisma, { data: { courses, users, notify } }), transactionOptions);
        await sendMailsCallback();
        return result;
    }),
  cancel: adminProcedure
    .input(z.strictObject({ id: z.number().int().min(0) }))
    .mutation(async ({ input: { id } }) =>
      prisma.$transaction(async (prisma) => cancelCourseRegistration(prisma, { where: { id } }), transactionOptions)),
  attended: adminProcedure
    .input(z.strictObject({ id: z.number().int().min(0), attended: z.boolean().nullable() }))
    .mutation(async ({ input: { id, attended } }) =>
      updateCourseRegistrationAttendance({ where: { id }, data: { attended } })),
});
