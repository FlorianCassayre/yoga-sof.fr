import { Course, Prisma } from '@prisma/client';
import { prisma, readTransaction, writeTransaction } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { Pagination } from './helpers/types';
import { createPaginated, createPrismaPagination } from './helpers/pagination';
import { notifyCourseCanceled } from '../email';
import { colonTimeToParts } from '../../common/date';
import { courseCreateManySchema } from '../../common/schemas/course';

export const findCourse = async <Where extends Prisma.CourseWhereUniqueInput, Select extends Prisma.CourseSelect, Include extends Prisma.CourseInclude>(args: { where: Where, select?: Select, include?: Include }) =>
  prisma.course.findUniqueOrThrow(args);

export const findCourses = async <T extends Prisma.CourseFindManyArgs>(args: Prisma.SelectSubset<T, Prisma.CourseFindManyArgs>) =>
  prisma.course.findMany<T>(args);

export const findCoursesPaginated = async <Where extends Prisma.CourseWhereInput, Select extends Prisma.CourseSelect, Include extends Prisma.CourseInclude, OrderBy extends Prisma.Enumerable<Prisma.CourseOrderByWithRelationInput>>(args: { pagination: Pagination, where?: Where, select?: Select, include?: Include, orderBy?: OrderBy }) => {
  const { pagination: { page, elementsPerPage }, ...rest } = args;
  const [totalElements, data] = await readTransaction(async (prisma) => Promise.all([
    prisma.course.count({ where: args.where }),
    prisma.course.findMany({ ...rest, ...createPrismaPagination(args.pagination) })
  ]))
  return createPaginated({
    page,
    elementsPerPage,
    totalElements,
    data,
  });
}

export const updateCourse = async <Where extends Prisma.CourseWhereUniqueInput, Data extends Partial<Pick<Course, 'slots' | 'price' | 'notes'>>, Select extends Prisma.CourseSelect, Include extends Prisma.CourseInclude>(args: { where: Where, data: Data, select?: Select, include?: Include }) => {
  const { where: { id }, data: { slots } } = args;
  return await writeTransaction(async (prisma) => {
    const course = await prisma.course.findUniqueOrThrow({ where: args.where, select: { isCanceled: true, dateEnd: true } });
    if ((args.data.slots !== undefined || args.data.price !== undefined) && course.isCanceled) {
      throw new ServiceError(ServiceErrorCode.CourseCanceledNoModification);
    }
    const nowExtended = new Date();
    nowExtended.setDate(nowExtended.getDate() - 1);
    if (course.dateEnd < nowExtended) {
      throw new ServiceError(ServiceErrorCode.CourseHasPassed);
    }
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
  const [result, sendMailCallback] = await writeTransaction(async (prisma) => {
    const course = await prisma.course.findUniqueOrThrow({ where });
    if (course.isCanceled) {
      throw new ServiceError(ServiceErrorCode.CourseAlreadyCanceled);
    }
    const nowExtended = new Date();
    nowExtended.setDate(nowExtended.getDate() - 1);
    if (course.dateEnd < nowExtended) {
      throw new ServiceError(ServiceErrorCode.CourseHasPassed);
    }
    const newCourse = await prisma.course.update({
      where,
      data: {
        isCanceled: true,
        ...(data as Pick<Course, 'cancelationReason'>),
      },
      include: { registrations: { include: { user: { include: { managedByUser: true } } } } }
    });
    const sendMailsCallback = await notifyCourseCanceled(prisma, { ...newCourse, cancelationReason: args.data.cancelationReason });
    return [newCourse, sendMailsCallback];
  });
  await sendMailCallback();
  return result;
};

export const createCourses = async (args: { data: Pick<Course, 'type' | 'price' | 'slots'> & { timeStart: string, timeEnd: string, dates: Date[] } }) => {
  courseCreateManySchema.parse({ ...args.data });
  const { data: { type, price, slots, timeStart, timeEnd, dates } } = args;
  dates.sort((a, b) => a.getTime() - b.getTime());
  const withTime = (date: Date, time: string): Date => {
    const copy = new Date(date);
    const [hours, minutes] = colonTimeToParts(time);
    copy.setHours(hours);
    copy.setMinutes(minutes);
    copy.setSeconds(0);
    copy.setMilliseconds(0);
    return copy;
  }
  return await prisma.course.createMany({
    data: dates.map(date => {
      return {
        type,
        price,
        slots,
        dateStart: withTime(date, timeStart),
        dateEnd: withTime(date, timeEnd)
      };
    })
  });
};
