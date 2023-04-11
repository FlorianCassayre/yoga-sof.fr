import {
  cancelCourseRegistration,
  createCourseRegistrations,
  findCourseRegistrationEvents,
  findCourseRegistrations, updateCourseRegistrationAttendance
} from '../../services';
import { z } from 'zod';
import { courseRegistrationCreateSchema } from '../../../common/schemas/courseRegistration';
import { adminProcedure, router } from '../trpc';
import { readTransaction, writeTransaction } from '../../prisma';

const selectorSchema = z.strictObject({
  courseId: z.number().int().min(0).optional(),
  userId: z.number().int().min(0).optional(),
  attended: z.boolean().optional(),
  isCanceled: z.boolean().optional(),
});

export const courseRegistrationRouter = router({
  findAll: adminProcedure
    .query(async () => readTransaction(async (prisma) => findCourseRegistrations(prisma, { include: { user: true, course: true } }))),
  findAllEvents: adminProcedure
    .input(selectorSchema)
    .query(async ({ input: { courseId, userId, attended, isCanceled } }) =>
      readTransaction(async (prisma) => findCourseRegistrationEvents(prisma, { where: { courseId, userId, attended, course: { isCanceled } }, include: { course: courseId === undefined, user: userId === undefined } }))),
  findAllActive: adminProcedure
    .input(selectorSchema.merge(z.object({ noOrder: z.boolean().optional() })))
    .query(async ({ input: { courseId, userId, noOrder, attended, isCanceled } }) => {
      // TODO extract this logic
      const activeArgs = { active: true }, inactiveArgs = { active: false };
      const whereActiveOrders = { where: { order: activeArgs }, select: { order: { select: { id: true } } } };
      const baseWhere = { courseId, userId, isUserCanceled: isCanceled ? undefined : false, attended, course: { isCanceled: isCanceled ? undefined : false } };
      const otherWhere = noOrder ? [
        { orderUsedCoupons: { every: { order: inactiveArgs } } },
        { orderTrial: { every: { order: inactiveArgs } } },
        { orderReplacementTo: { every: { order: inactiveArgs } } },
        { orderPurchased: { every: inactiveArgs } },
      ] : [];
      return readTransaction(async (prisma) => prisma.courseRegistration.findMany({
        where: { AND: [baseWhere, ...otherWhere] },
        include: {
          course: true,
          user: { include: { memberships: true } },
          orderUsedCoupons: whereActiveOrders,
          orderTrial: whereActiveOrders,
          orderReplacementFrom: whereActiveOrders,
          orderReplacementTo: whereActiveOrders,
          orderPurchased: { where: activeArgs, select: { id: true } },
        },
      }));
    }),
  create: adminProcedure
    .input(courseRegistrationCreateSchema)
    .mutation(async ({ input: { courses, users, notify } }) => {
        const [result, sendMailsCallback] = await writeTransaction(async (prisma) => createCourseRegistrations(prisma, { data: { courses, users, notify, admin: true } }));
        await sendMailsCallback();
        return result;
    }),
  cancel: adminProcedure
    .input(z.strictObject({ id: z.number().int().min(0) }))
    .mutation(async ({ input: { id } }) =>
      writeTransaction(async (prisma) => cancelCourseRegistration(prisma, { where: { id }, data: { admin: true } }))),
  attended: adminProcedure
    .input(z.strictObject({ id: z.number().int().min(0), attended: z.boolean().nullable() }))
    .mutation(async ({ input: { id, attended } }) =>
      updateCourseRegistrationAttendance({ where: { id }, data: { attended } })),
});
