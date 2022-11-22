import { Course, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { Pagination } from './helpers/types';
import { createPaginated, createPrismaPagination } from './helpers/pagination';
import { notifyCourseCanceled } from '../newEmail';

export const findCourse = async <Where extends Prisma.CourseWhereUniqueInput, Select extends Prisma.CourseSelect, Include extends Prisma.CourseInclude>(args: { where: Where, select?: Select, include?: Include }) =>
  prisma.course.findUniqueOrThrow(args);

export const findCourses = async <Where extends Prisma.CourseWhereInput, Select extends Prisma.CourseSelect, Include extends Prisma.CourseInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseOrderByWithRelationInput>>(args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
  prisma.course.findMany(args);

export const findCoursesPaginated = async <Where extends Prisma.CourseWhereInput, Select extends Prisma.CourseSelect, Include extends Prisma.CourseInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseOrderByWithRelationInput>>(args: { pagination: Pagination, where?: Where, select?: Select, include?: Include, orderBy?: OrderBy }) => {
  const { pagination: { page, elementsPerPage }, ...rest } = args;
  const [totalElements, data] = await prisma.$transaction([
    prisma.course.count({ where: args.where }),
    prisma.course.findMany({ ...rest, ...createPrismaPagination(args.pagination) })
  ])
  return createPaginated({
    page,
    elementsPerPage,
    totalElements,
    data,
  });
}

export const updateCourse = async <Where extends Prisma.CourseWhereUniqueInput, Data extends Partial<Pick<Course, 'slots' | 'price' | 'notes'>>, Select extends Prisma.CourseSelect, Include extends Prisma.CourseInclude>(args: { where: Where, data: Data, select?: Select, include?: Include }) => {
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
};

export const cancelCourse = async <Where extends Prisma.CourseWhereUniqueInput, Data extends Pick<Course, 'cancelationReason'>, Select extends Prisma.CourseSelect, Include extends Prisma.CourseInclude>(args: { where: Where, data: Data, select?: Select, include?: Include }) => {
  const { where, data, ...rest } = args;
  return await prisma.$transaction(async () => {
    const course = await prisma.course.findUniqueOrThrow({ where });
    if (course.isCanceled) {
      throw new ServiceError(ServiceErrorCode.CourseAlreadyCanceled);
    }
    if (course.dateEnd < new Date()) {
      throw new ServiceError(ServiceErrorCode.CourseHasPassed);
    }
    const returned = prisma.course.update({
      where,
      data: {
        isCanceled: true,
        ...(data as Pick<Course, 'cancelationReason'>),
      },
      ...rest
    });
    await notifyCourseCanceled(await prisma.course.findUniqueOrThrow({ where, include: { registrations: { include: { user: true } } } }));
    return returned;
  });
};
