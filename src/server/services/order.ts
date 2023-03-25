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

    // We keep only the orders that are active (= not deleted)
    const orderArgs = { where: { order: { active: true } } };
    const purchasedCourseRegistrationIds = data.purchases.courseRegistrations?.map(({ id }) => id) ?? [];
    const courseRegistrations = makeRecord(await Promise.all(purchasedCourseRegistrationIds.concat(data.billing.replacementCourseRegistrations?.map(r => r.fromCourseRegistrationId) ?? []).map((id) =>
      prisma.courseRegistration.findUniqueOrThrow(({ where: { id }, include: {
          course: true,
          orderUsedCoupons: orderArgs,
          orderTrial: orderArgs,
          orderReplacementFrom: orderArgs,
          orderReplacementTo: orderArgs,
        } }))
    )));

    const coupons = makeRecord(await Promise.all(
      (data.purchases.existingCoupons?.map(({ id }) => id) ?? []).concat(data.billing.existingCoupons?.map(a => a.couponId) ?? [])
    .map(id => prisma.coupon.findUniqueOrThrow({ where: { id }, include: { orderCourseRegistrations: orderArgs } }))));
    const couponModels = makeRecord(await Promise.all(
      data.purchases.newCoupons?.map(({ couponModel: { id } }) => prisma.couponModel.findUniqueOrThrow({ where: { id } })) ?? []
    ));
    const membershipModels = makeRecord(await Promise.all(
      data.purchases.newMemberships?.map(({ membershipModelId: id }) => prisma.membershipModel.findUniqueOrThrow({ where: { id } })) ?? []
    ));
    const memberships = makeRecord(await Promise.all((data.purchases.existingMembershipIds ?? []).map(id => prisma.membership.findUniqueOrThrow({ where: { id } }))));

    // Transaction
    if (transaction !== null) {
      if (user.id !== transaction.userId) {
        throw new ServiceError(ServiceErrorCode.OrderTransactionDifferentUser);
      }
      if (transaction.orderId !== null) {
        throw new ServiceError(ServiceErrorCode.OrderTransactionAlreadyLinked);
      }
    }

    // Course registrations (general)
    if (purchasedCourseRegistrationIds.map(id => courseRegistrations[id]).some(({ isUserCanceled }) => isUserCanceled)) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationNotRegistered);
    }
    const isPartOfOrder = (r: (typeof courseRegistrations)[number]): boolean => [r.orderUsedCoupons, r.orderTrial, r.orderReplacementTo].flat().length > 0;
    if (purchasedCourseRegistrationIds.map(id => courseRegistrations[id]).some(r => isPartOfOrder(r))) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationAlreadyOrdered);
    }

    // Replacements
    const replacedFrom = data.billing.replacementCourseRegistrations?.map(({ fromCourseRegistrationId: id }) => courseRegistrations[id]) ?? [];
    if (replacedFrom.some(r => !isPartOfOrder(r))) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationReplacementNotOrdered);
    }
    if (replacedFrom.some(r => r.orderReplacementFrom.length > 0)) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationReplacementAlreadyReplaced);
    }
    if (replacedFrom.some(r => !r.course.isCanceled && !r.isUserCanceled)) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationReplacementNotCancelled);
    }

    // Coupons (use)
    if (data.billing.newCoupons?.some(c => c.courseRegistrationIds.length > couponModels[(data.purchases.newCoupons ?? [])[c.newCouponIndex].couponModel.id].quantity)) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationCouponFull);
    }
    if (data.billing.existingCoupons?.some(c => coupons[c.couponId].orderCourseRegistrations.length + c.courseRegistrationIds.length > coupons[c.couponId].quantity)) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationCouponFull);
    }

    // Coupons (purchase)

    // Membership (purchase)

    // TODO check if coupons and memberships have already been purchased

    // ---

    // Total
    const sum = (array: number[]): number => array.reduce((a, b) => a + b, 0);

    const totalAmountCourses = sum(purchasedCourseRegistrationIds.map(id => {
      const courseRegistration = courseRegistrations[id];
      if (data.billing.existingCoupons?.some(c => c.courseRegistrationIds.includes(id)) || data.billing.newCoupons?.some(c => c.courseRegistrationIds.includes(id))) {
        return 0; // Use coupon
      } else if (data.billing.replacementCourseRegistrations?.some(r => r.toCourseRegistrationId === id)) {
        return 0; // Use paid course as a replacement
      } else if (data.billing.trialCourseRegistrationId === id) {
        return 0; // Trial TODO custom price
      } else {
        return courseRegistration.course.price;
      }
    }));
    const totalAmountCoupons = sum(
      (data.purchases.existingCoupons?.map(({ id }) => coupons[id].price) ?? [])
        .concat(data.purchases.newCoupons?.map(c => couponModels[c.couponModel.id].price) ?? [])
    );
    const totalAmountMemberships = sum(
      (data.purchases.existingMembershipIds?.map(id => memberships[id].price) ?? [])
        .concat(data.purchases.newMemberships?.map(m => membershipModels[m.membershipModelId].price) ?? [])
    )
    const computedAmount = totalAmountCourses + totalAmountCoupons + totalAmountMemberships;

    // If there are no payments there will be no dates, in that case it makes sense to set it to the current day
    const date = transaction?.date ?? data.billing.newPayment?.date ?? new Date();

    // TODO create coupons and memberships

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        date: date,
        computedAmount: computedAmount,
        notes: data.notes,
        // Children
        usedCouponCourseRegistrations: undefined, // TODO link them here
        purchasedCoupons: {
          // TODO create (outside)
          connect: data.purchases.existingCoupons?.map(({ id }) => ({ id })) ?? [],
        },
        purchasedMemberships: {
          // TODO create (outside)
          connect: data.purchases.existingMembershipIds?.map(id => ({ id })) ?? [],
        },
        trialCourseRegistrations: {
          create: data.billing.trialCourseRegistrationId !== undefined ? [{
            courseRegistrationId: data.billing.trialCourseRegistrationId,
            price: 0, // TODO FIXME
          }] : [],
        },
        replacementCourseRegistrations: {
          create: data.billing.replacementCourseRegistrations?.map(r => ({
            fromCourseRegistrationId: r.fromCourseRegistrationId,
            toCourseRegistrationId: r.toCourseRegistrationId,
          })) ?? [],
        },
        payment: transaction ? {
          create: {
            amount: transaction.amount,
            type: transaction.type,
          },
        } : data.billing.newPayment ? {
          create: {
            amount: data.billing.newPayment.amount,
            type: data.billing.newPayment.type,
          },
        } : undefined,
        transaction: transaction ? {
          connect: {
            id: transaction.id,
          },
        } : undefined,
      },
    });

    return order;
  });
};
