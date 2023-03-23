import { z } from 'zod';
import { prisma } from '../prisma';
import { orderCreateSchema } from '../../common/schemas/order';
import { Prisma } from '@prisma/client';
import { ServiceError, ServiceErrorCode } from './helpers/errors';

export const findOrder = async (args: { where: Prisma.OrderWhereUniqueInput }) => {
  const courseRegistrationArgs = {
    include: {
      course: true,
    },
  };
  return prisma.order.findUniqueOrThrow({ ...args, include: {
      user: true,
      usedCouponCourseRegistrations: {
        include: {
          coupon: true,
          courseRegistration: courseRegistrationArgs,
        },
      },
      purchasedCoupons: true,
      purchasedMemberships: {
        include: {
          users: true,
        },
      },
      trialCourseRegistrations: {
        include: {
          courseRegistration: courseRegistrationArgs,
        }
      },
      replacementCourseRegistrations: {
        include: {
          fromCourseRegistration: courseRegistrationArgs,
          toCourseRegistration: courseRegistrationArgs,
        },
      },
      payment: true,
    },
  });
};


export const findOrders = async (args: { where: { includeDisabled: boolean, userId?: number } }) => {
  const orderArgs = { where: { active: args.where.includeDisabled ? undefined : true }, include: { user: true, payment: true } };
  return args.where.userId === undefined
    ? prisma.order.findMany(orderArgs)
    : prisma.user.findUniqueOrThrow({ where: { id: args.where.userId } }).orders(orderArgs);
};

export const createOrder = async (args: { data: z.infer<typeof orderCreateSchema> }) => {
  orderCreateSchema.parse(args.data);

  // Remark: we don't check if the registration belong to the user because it is allowed (even though the UI doesn't permit it yet)

  const makeRecord = <T extends number | string, O extends { id: T }>(array: O[]): Record<T, O> =>
    Object.fromEntries(array.map(o => [o.id, o])) as any;

  return prisma.$transaction(async (prisma) => {
    const { data } = args;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: data.user.id } });
    const transaction = data.billing.transactionId !== undefined ? await prisma.transaction.findUniqueOrThrow({ where: { id: data.billing.transactionId } }) : null;

    const orderArgs = { where: { order: { active: true } } };
    const purchasedCourseRegistrations = data.purchases.courseRegistrations?.map(({ id }) => id) ?? [];
    const courseRegistrations = makeRecord(await Promise.all(purchasedCourseRegistrations.concat(data.billing.replacementCourseRegistrations?.map(r => r.fromCourseRegistrationId) ?? []).map((id) =>
      prisma.courseRegistration.findUniqueOrThrow(({ where: { id }, include: {
          orderUsedCoupons: orderArgs,
          orderTrial: orderArgs,
          orderReplacementFrom: orderArgs,
          orderReplacementTo: orderArgs,
        } }))
    )));

    const coupons = makeRecord(await Promise.all(
      (data.purchases.existingCoupons?.map(({ id }) => id) ?? []).concat(data.billing.existingCoupons?.map(a => a.couponId) ?? [])
    .map(id => prisma.coupon.findUniqueOrThrow({ where: { id } }))));
    const memberships = makeRecord(await Promise.all((data.purchases.existingMembershipIds ?? []).map(id => prisma.membership.findUniqueOrThrow({ where: { id } }))));

    if (transaction !== null) {
      if (user.id !== transaction.userId) {
        throw new ServiceError(ServiceErrorCode.OrderTransactionDifferentUser);
      }
      if (transaction.orderId !== null) {
        throw new ServiceError(ServiceErrorCode.OrderTransactionAlreadyLinked);
      }
    }

    if (purchasedCourseRegistrations.map(id => courseRegistrations[id]).some(({ isUserCanceled }) => isUserCanceled)) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationNotRegistered);
    }
    // FIXME
    if (Object.values(courseRegistrations).some(r => [r.orderUsedCoupons, r.orderTrial, r.orderReplacementFrom, r.orderReplacementTo].flat().length > 0)) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationAlreadyOrdered);
    }
    // FIXME
    if (data.billing.replacementCourseRegistrations?.map(({ fromCourseRegistrationId }) => courseRegistrations[fromCourseRegistrationId])) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationReplacementNotOrdered);
    }

    // TODO: coupon capacity
    //


    const date = new Date(); // TODO FIXME (use the payment date, otherwise now)
    const computedAmount = 0; // TODO FIXME

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        date: date,
        computedAmount: computedAmount,
        notes: data.notes,
        // Children
      }
    });

    if (transaction !== null) {
      await prisma.transaction.update({ where: { id: transaction.id }, data: { orderId: order.id } });
    }


    return order;
  });
};
