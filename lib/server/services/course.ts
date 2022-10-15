import { Course, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';

export const findCourse = async (args: { where: Prisma.CourseWhereUniqueInput, select?: Prisma.CourseSelect, include?: Prisma.CourseInclude }) =>
  prisma.course.findUniqueOrThrow(args);

export const findCourses = async (args: { where?: Prisma.CourseWhereInput, select?: Prisma.CourseSelect, include?: Prisma.CourseInclude }) =>
  prisma.course.findMany(args);

export const updateCourse = async (args: { where: Prisma.CourseWhereUniqueInput, data: Partial<Pick<Course, 'slots' | 'notes'>>, select?: Prisma.CourseSelect, include?: Prisma.CourseInclude }) => {
  const { where: { id }, data: { slots } } = args;
  return await prisma.$transaction(async () => {
    if (slots !== undefined) {
      const count = await prisma.courseRegistration.count({
        where: {
          courseId: id,
          isUserCanceled: false,
        },
      });
      if (slots < count) {
        throw new ServiceError(ServiceErrorCode.FewerSlotsThanRegistered);
      }
    }
    return prisma.course.update(args);
  });
}

export const cancelCourse = async (args: { where: Prisma.CourseWhereUniqueInput, data: Partial<Pick<Course, 'cancelationReason'>>, select?: Prisma.CourseSelect, include?: Prisma.CourseInclude }) => {
  const { where, data, ...rest } = args;
  return await prisma.$transaction(async () => {
    const course = await prisma.course.findUniqueOrThrow({ where });
    if (course.isCanceled) {
      throw new ServiceError(ServiceErrorCode.CourseAlreadyCanceled);
    }
    if (course.dateEnd < new Date()) {
      throw new ServiceError(ServiceErrorCode.CourseHasPassed);
    }
    return prisma.course.update({
      where,
      data: {
        isCanceled: true,
        ...data,
      },
      ...rest
    });
  });
};
