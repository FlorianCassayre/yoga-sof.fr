import { CourseRegistration, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { courseRegistrationCreateSchema } from '../../common/newSchemas/courseRegistration';
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

export const findCourseRegistrations = async <Where extends Prisma.CourseRegistrationWhereInput, Select extends Prisma.CourseRegistrationSelect, Include extends Prisma.CourseRegistrationInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseRegistrationOrderByWithRelationInput>>(args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
  prisma.courseRegistration.findMany(args);

export const findCourseRegistrationEvents = async <Where extends Pick<Prisma.CourseRegistrationWhereInput, 'courseId' | 'userId'>, Select extends Prisma.CourseRegistrationSelect, Include extends Prisma.CourseRegistrationInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseRegistrationOrderByWithRelationInput>>(args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
 registrationsToEvent(await findCourseRegistrations(args))

export const createCourseRegistrations = async (args: { data: { courses: number[], users: number[], notify: boolean } }) => {
  courseRegistrationCreateSchema.parse(args.data);
  return await prisma.$transaction(async () => {
    const now = new Date();
    const newRegistrations: number[] = [];
    for (const userId of args.data.users) {
      for (const courseId of args.data.courses) {
        const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId }, include: { registrations: { where: { isUserCanceled: false } } } });
        if (course.isCanceled) {
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
        const { id: newRegistrationId } = await prisma.courseRegistration.create({ data: { courseId, userId }, select: { id: true } });
        newRegistrations.push(courseId);
      }
    }
    if (args.data.notify) {
      for (const userId of args.data.users) {
        await notifyCourseRegistration(userId, args.data.courses);
      }
    }
    return newRegistrations;
  });
};

export const cancelCourseRegistration = async (args: { where: { id: number } }) => {
  return prisma.$transaction(async () => {
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
  });
};

export const updateCourseRegistrationAttendance = async (args: { where: { id: number }, data: { attended: boolean | null } }) => {
  return prisma.$transaction(async () => {
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
