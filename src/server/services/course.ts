import { Course, Prisma } from '@prisma/client';
import { prisma, readTransaction, writeTransaction } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { Pagination } from './helpers/types';
import { createPaginated, createPrismaPagination } from './helpers/pagination';
import { notifyCourseCanceled } from '../email';
import { colonTimeToParts } from '../../common/date';
import { courseCreateManySchema } from '../../common/schemas/course';

export const findCourse = async (args: { where: Prisma.CourseWhereUniqueInput }) =>
  prisma.course.findUniqueOrThrow({ where: args.where, include: { registrations: true } });

export const findUpdateCourse = (args: { where: Prisma.CourseWhereUniqueInput }) => prisma.course.findUniqueOrThrow({ where: args.where, select: { id: true, slots: true, price: true } });

export const findUpdateCourseNotes = (args: { where: Prisma.CourseWhereUniqueInput }) => prisma.course.findUniqueOrThrow({ where: args.where, select: { id: true, notes: true } });

export const findCourses = () => prisma.course.findMany();

export const findCoursesRelated = async (args: { where: Prisma.CourseWhereUniqueInput }) => readTransaction(async prisma => {
  const course = await prisma.course.findUniqueOrThrow(args);
  const deltaWeek = (date: Date, deltaInWeeks: number): Date => {
    const daysInWeek = 7;
    const copy = new Date(date);
    copy.setDate(copy.getDate() + deltaInWeeks * daysInWeek);
    return copy;
  };
  const [previous, next, previousWeek, nextWeek] = await Promise.all([
    prisma.course.findFirst({ where: { dateStart: { lt: course.dateStart } }, orderBy: { dateStart: 'desc' } }),
    prisma.course.findFirst({ where: { dateStart: { gt: course.dateStart } }, orderBy: { dateStart: 'asc' } }),
    prisma.course.findFirst({ where: { dateStart: deltaWeek(course.dateStart, -1) } }),
    prisma.course.findFirst({ where: { dateStart: deltaWeek(course.dateStart, 1) } }),
  ]);
  return {
    previous,
    next,
    previousWeek,
    nextWeek,
  };
});

export const updateCourse = async (args: { where: Prisma.CourseWhereUniqueInput, data: Partial<Pick<Course, 'slots' | 'price' | 'notes'>> }) => {
  const { where: { id }, data: { slots, price } } = args;
  return await writeTransaction(async (prisma) => {
    const course = await prisma.course.findUniqueOrThrow({ where: args.where, select: { isCanceled: true, dateEnd: true, price: true, registrations: { select: { isUserCanceled: true, orderPurchased: { select: { id: true } } } } } });
    if ((args.data.slots !== undefined || args.data.price !== undefined) && course.isCanceled) {
      throw new ServiceError(ServiceErrorCode.CourseCanceledNoModification);
    }
    const nowExtended = new Date();
    nowExtended.setDate(nowExtended.getDate() - 1);
    if (course.dateEnd < nowExtended && (slots !== undefined || price !== undefined)) {
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
    if (args.data.price !== undefined && args.data.price !== course.price && !course.registrations.every(r => r.orderPurchased.length === 0 && (r.isUserCanceled || course.isCanceled))) {
      throw new ServiceError(ServiceErrorCode.CoursePriceCannotBeModified);
    }
    return prisma.course.update(args);
  });
};

export const cancelCourse = async (args: { where: Prisma.CourseWhereUniqueInput, data: Pick<Course, 'cancelationReason'> }) => {
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
        ...data,
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
