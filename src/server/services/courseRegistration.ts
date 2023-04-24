import { CourseRegistration, Prisma } from '@prisma/client';
import { prisma, writeTransaction } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { courseRegistrationCreateSchema } from '../../common/schemas/courseRegistration';
import { notifyCourseRegistration } from '../email';

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(date.getDate() + days);
  return copy;
};

const registrationsToEvent = <T extends CourseRegistration>(registrations: T[]) =>
  registrations.flatMap(registration => [{
    isEventTypeUserCanceled: false,
    date: registration.createdAt,
    registration,
  }, ...(registration.isUserCanceled ? [{
    isEventTypeUserCanceled: true,
    date: registration.canceledAt as Date,
    registration,
  }] : [])]).sort(({ date: date1 }, { date: date2 }) => date2.getTime() - date1.getTime());

export const findCourseRegistrations = (prisma: Prisma.TransactionClient) =>
  prisma.courseRegistration.findMany({ include: { course: true, user: true } });

export const findCourseRegistrationEvents = async (prisma: Prisma.TransactionClient, { courseId, userId, attended, isCanceled }: { courseId?: number, userId?: number, attended?: boolean, isCanceled?: boolean }) =>
 registrationsToEvent(await prisma.courseRegistration.findMany({ where: { courseId, userId, attended, course: { isCanceled } }, include: { course: true, user: true } }));

export const findCourseRegistrationsForReplacement = async (args: { where?: { userId?: number } } = {}) => {
  const activeArgs = { active: true };
  const someActiveOrders = { some: { order: activeArgs } };
  return prisma.courseRegistration.findMany({
    where: {
      AND: [
        {
          ...(args.where?.userId !== undefined ? { userId: args.where.userId } : {}),
          orderReplacementFrom: { every: { order: { active: false } } },
        },
        {
          OR: [
            { orderUsedCoupons: someActiveOrders },
            { orderTrial: someActiveOrders },
            { orderReplacementTo: someActiveOrders },
            { orderPurchased: { some: activeArgs } },
          ],
        },
        {
          OR: [
            { isUserCanceled: true },
            { course: { isCanceled: true } },
          ],
        },
      ]
    },
    include: {
      user: true,
      course: true,
    },
  });
};

export const createCourseRegistrations = async (prisma: Prisma.TransactionClient, args: { data: { courses: number[], users: number[], notify: boolean, admin: boolean } }) => {
  const { admin, ...data } = args.data;
  courseRegistrationCreateSchema.parse(data);
  const now = new Date();
  const newRegistrations: number[] = [];
  const newRegistrationsPerUser: [Prisma.UserGetPayload<{ include: { managedByUser: true } }>, Prisma.CourseRegistrationGetPayload<{ include: { course: true } }>[]][] = [];
  for (const userId of args.data.users) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { managedByUser: true } });
    const newRegistrationsForUser: (typeof newRegistrationsPerUser)[0][1] = [];
    for (const courseId of args.data.courses) {
      const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId }, include: { registrations: { where: { isUserCanceled: false } } } });
      if (course.isCanceled) {
        throw new ServiceError(ServiceErrorCode.CourseCanceledNoRegistration);
      }
      if (course.dateStart.getTime() <= now.getTime() && (!admin || now >= addDays(course.dateEnd, 1))) {
        throw new ServiceError(ServiceErrorCode.CoursePassedNoRegistration);
      }
      if (course.registrations.length >= course.slots) {
        throw new ServiceError(ServiceErrorCode.CourseFullNoRegistration);
      }
      if (course.registrations.some(({ userId: registeredUserId }) => userId === registeredUserId)) {
        throw new ServiceError(ServiceErrorCode.UserAlreadyRegistered);
      }
      const registration = await prisma.courseRegistration.create({ data: { courseId, userId }, include: { course: true } });
      newRegistrations.push(courseId);
      newRegistrationsForUser.push(registration);
    }
    newRegistrationsPerUser.push([user, newRegistrationsForUser]);
  }
  let sendMailsCallback;
  if (args.data.notify) {
    const callbacks = await Promise.all(newRegistrationsPerUser.map(([user, registrations]) => notifyCourseRegistration(prisma, user, registrations)));
    sendMailsCallback = async () => {
      await Promise.all(callbacks.map(callback => callback()));
    };
  } else {
    sendMailsCallback = async () => {};
  }
  return [newRegistrations, sendMailsCallback] as const;
};

export const cancelCourseRegistration = async (prisma: Prisma.TransactionClient, args: { where: { id: number }, data: { admin: boolean } }) => {
  const id = args.where.id;
  const now = new Date();
  const nowEarlier = new Date(now), nowLater = new Date(now);
  nowEarlier.setDate(nowEarlier.getDate() - 1);
  nowLater.setDate(nowLater.getDate() + 1);
  const courseRegistration = await prisma.courseRegistration.findUniqueOrThrow({ where: { id }, include: { course: true } });
  if (courseRegistration.course.isCanceled) {
    throw new ServiceError(ServiceErrorCode.CourseCanceledNoUnregistration);
  }
  if (!(
    (!args.data.admin && nowLater.getTime() < courseRegistration.course.dateStart.getTime())
    || (args.data.admin && nowEarlier.getTime() < courseRegistration.course.dateEnd.getTime())
  )) {
    throw new ServiceError(ServiceErrorCode.CoursePassedNoUnregistration);
  }
  if (courseRegistration.isUserCanceled) {
    throw new ServiceError(ServiceErrorCode.UserNotRegistered);
  }
  return prisma.courseRegistration.update({ where: { id }, data: { isUserCanceled: true, canceledAt: now } });
};

export const updateCourseRegistrationAttendance = async (args: { where: { id: number }, data: { attended: boolean | null } }) => {
  return writeTransaction(async (prisma) => {
    const courseRegistration = await prisma.courseRegistration.findUniqueOrThrow({ where: { id: args.where.id }, include: { course: true } });
    if (courseRegistration.course.isCanceled) {
      throw new ServiceError(ServiceErrorCode.CourseCanceledAttendance);
    }
    if (courseRegistration.isUserCanceled) {
      throw new ServiceError(ServiceErrorCode.UserNotRegisteredAttendance);
    }
    return prisma.courseRegistration.update(args);
  });
};

export const findCourseRegistrationsPublic = async (prisma: Prisma.TransactionClient, { userId, future, userCanceled }: { userId: number, userCanceled: boolean, future: boolean | null }) => {
  const whereCourseFuture = {
    dateEnd: {
      gt: new Date(),
    },
  };
  const activeArgs = { active: true };
  const whereActiveOrders = { where: { order: activeArgs }, select: { order: { select: { id: true } } } };
  const result = await prisma.courseRegistration.findMany({
    where: {
      userId,
      isUserCanceled: userCanceled,
      course: future == null ? {} : future ? whereCourseFuture : { NOT: whereCourseFuture },
    },
    select: {
      id: true,
      isUserCanceled: true,
      createdAt: true,
      canceledAt: true,
      course: {
        select: {
          id: true,
          type: true,
          dateStart: true,
          dateEnd: true,
          isCanceled: true,
        },
      },
      orderUsedCoupons: whereActiveOrders,
      orderTrial: whereActiveOrders,
      orderReplacementTo: whereActiveOrders,
      orderPurchased: { where: activeArgs, select: { id: true } },
    },
  });

  return result.map(({ orderUsedCoupons, orderTrial, orderReplacementTo, orderPurchased, ...rest }) => ({
    ...rest,
    paid: [orderUsedCoupons, orderTrial, orderReplacementTo, orderPurchased].flat().length > 0,
  }));
}
