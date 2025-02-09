import { Prisma } from '@prisma/client';
import { ServiceError, ServiceErrorCode } from './helpers/errors';

const getCourseWhere = (userId: number) => ({
  isCanceled: false,
  visible: true,
  // Just in case, the user should not already be registered (it's OK if we omit this condition though)
  registrations: {
    every: {
      OR: [
        { NOT: { userId } },
        { isUserCanceled: true },
      ],
    },
  },
});

const findUserWaitingList = (prisma: Prisma.TransactionClient, { where }: { where: { userId: number, courseId?: number } })=>
  prisma.courseWaitingList.findMany({
    where: {
      userId: where.userId,
      courseId: where.courseId,
      isNotified: false,
      course: getCourseWhere(where.userId),
    },
    select: {
      id: true,
      course: {
        select: {
          id: true,
          type: true,
          dateStart: true,
          dateEnd: true,
        },
      },
    },
  });

export const findUserWaitingListSubscriptionPublic = async (prisma: Prisma.TransactionClient, { where: { userId } }: { where: { userId: number } }) => {
  const waitingList = await findUserWaitingList(prisma, { where: { userId } });
  return waitingList.map(({ course }) => course);
};

export const subscribeUserWaitingListPublic = async (prisma: Prisma.TransactionClient, { where: { userId, courseId } }: { where: { userId: number, courseId: number } }) => {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      slots: true,
      registrations: {
        where: {
          isUserCanceled: false,
        },
      },
    },
    where: {
      ...getCourseWhere(userId),
      id: courseId,
    },
  });
  const ids = await findUserWaitingList(prisma, { where: { userId, courseId } });
  if (!courses.some(({ slots, registrations }) => registrations.length >= slots) || ids.length > 0) {
    throw new ServiceError(ServiceErrorCode.CourseWaitingListCannotSubscribed);
  }
  await prisma.courseWaitingList.create({
    data: {
      userId,
      courseId,
    },
  });
};

export const unsubscribeUserWaitingListPublic = async (prisma: Prisma.TransactionClient, { where: { userId, courseId } }: { where: { userId: number, courseId: number } }) => {
  const ids = await findUserWaitingList(prisma, { where: { userId, courseId } });
  if (ids.length === 0) {
    throw new ServiceError(ServiceErrorCode.CourseWaitingListNotFound);
  }
  await prisma.courseWaitingList.deleteMany({ where: { id: { in: ids.map(({ id }) => id) } } });
};
