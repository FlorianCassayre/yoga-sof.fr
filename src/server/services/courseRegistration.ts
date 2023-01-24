import { CourseRegistration, Prisma, User } from '@prisma/client';
import { prisma, transactionOptions } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { courseRegistrationCreateSchema } from '../../common/schemas/courseRegistration';
import { notifyCourseRegistration } from '../email';

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

export const findCourseRegistrations = async <Where extends Prisma.CourseRegistrationWhereInput, Select extends Prisma.CourseRegistrationSelect, Include extends Prisma.CourseRegistrationInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseRegistrationOrderByWithRelationInput>>(prisma: Prisma.TransactionClient, args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
  prisma.courseRegistration.findMany(args);

export const findCourseRegistrationEvents = async <Where extends Pick<Prisma.CourseRegistrationWhereInput, 'courseId' | 'userId'>, Select extends Prisma.CourseRegistrationSelect, Include extends Prisma.CourseRegistrationInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseRegistrationOrderByWithRelationInput>>(prisma: Prisma.TransactionClient, args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
 registrationsToEvent(await findCourseRegistrations(prisma, args))

export const createCourseRegistrations = async (prisma: Prisma.TransactionClient, args: { data: { courses: number[], users: number[], notify: boolean } }) => {
  courseRegistrationCreateSchema.parse(args.data);
  const now = new Date();
  const newRegistrations: number[] = [];
  const newRegistrationsPerUser: [Prisma.UserGetPayload<{ include: { managedByUser: true } }>, Prisma.CourseRegistrationGetPayload<{ include: { course: true } }>[]][] = [];
  for (const userId of args.data.users) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { managedByUser: true } });
    const newRegistrationsForUser: (typeof newRegistrationsPerUser)[0][1] = [];
    for (const courseId of args.data.courses) {
      const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId }, include: { registrations: { where: { isUserCanceled: false } } } });
      const { price } = course;if (course.isCanceled) {
        throw new ServiceError(ServiceErrorCode.CourseCanceledNoRegistration);
      }
      if (course.dateStart.getTime() <= now.getTime()) {
        throw new ServiceError(ServiceErrorCode.CoursePassedNoRegistration);
      }
      if (course.registrations.length >= course.slots) {
        throw new ServiceError(ServiceErrorCode.CourseFullNoRegistration);
      }
      if (course.registrations.some(({ userId: registeredUserId }) => userId === registeredUserId)) {
        throw new ServiceError(ServiceErrorCode.UserAlreadyRegistered);
      }
      const registration = await prisma.courseRegistration.create({ data: { courseId, userId, price }, include: { course: true } });
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

export const cancelCourseRegistration = async (prisma: Prisma.TransactionClient, args: { where: { id: number } }) => {
  const id = args.where.id;
  const now = new Date();
  const courseRegistration = await prisma.courseRegistration.findUniqueOrThrow({ where: { id }, include: { course: true } });
  if (courseRegistration.course.isCanceled) {
    throw new ServiceError(ServiceErrorCode.CourseCanceledNoUnregistration);
  }
  if (courseRegistration.course.dateStart.getTime() <= now.getTime()) {
    throw new ServiceError(ServiceErrorCode.CoursePassedNoUnregistration);
  }
  if (courseRegistration.isUserCanceled) {
    throw new ServiceError(ServiceErrorCode.UserNotRegistered);
  }
  return prisma.courseRegistration.update({ where: { id }, data: { isUserCanceled: true, canceledAt: now } });
};

export const updateCourseRegistrationAttendance = async (args: { where: { id: number }, data: { attended: boolean | null } }) => {
  return prisma.$transaction(async (prisma) => {
    const courseRegistration = await prisma.courseRegistration.findUniqueOrThrow({ where: { id: args.where.id }, include: { course: true } });
    if (courseRegistration.course.isCanceled) {
      throw new ServiceError(ServiceErrorCode.CourseCanceledAttendance);
    }
    if (courseRegistration.isUserCanceled) {
      throw new ServiceError(ServiceErrorCode.UserNotRegisteredAttendance);
    }
    return prisma.courseRegistration.update(args);
  }, transactionOptions);
};

export const findCourseRegistrationsPublic = (prisma: Prisma.TransactionClient, { userId, future, userCanceled }: { userId: number, userCanceled: boolean, future: boolean | null }) => {
  const whereCourseFuture = {
    dateEnd: {
      gt: new Date(),
    },
  };
  return findCourseRegistrations(prisma, {
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
    },
  });
}
