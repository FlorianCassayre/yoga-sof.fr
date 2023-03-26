import { z } from 'zod';
import { prisma, transactionOptions } from '../prisma';
import { orderCreateSchema } from '../../common/schemas/order';
import { Prisma } from '@prisma/client';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { createCoupon } from './coupon';
import { createMembership } from './membership';

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
      purchasedCourseRegistrations: courseRegistrationArgs,
      payment: true,
      transaction: true,
    },
  });
};


export const findOrders = async (args: { where: { includeDisabled: boolean, userId?: number } }) => {
  const orderArgs = { where: { active: args.where.includeDisabled ? undefined : true }, include: {
      user: true,
      payment: true,
      usedCouponCourseRegistrations: { select: { courseRegistrationId: true } },
      purchasedCoupons: { select: { id: true } },
      purchasedMemberships: { select: { id: true } },
      trialCourseRegistrations: { select: { courseRegistrationId: true } },
      replacementCourseRegistrations: { select: { fromCourseRegistrationId: true } },
      purchasedCourseRegistrations: { select: { id: true } },
    },
  };
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
    const activeArgs = { active: true };
    const whereActiveOrders = { where: { order: activeArgs } };
    const anyPurchasedCourseRegistrationIds = data.purchases.courseRegistrations?.map(({ id }) => id) ?? [];
    const courseRegistrations = makeRecord(await Promise.all(anyPurchasedCourseRegistrationIds.concat(data.billing.replacementCourseRegistrations?.map(r => r.fromCourseRegistrationId) ?? []).map((id) =>
      prisma.courseRegistration.findUniqueOrThrow(({ where: { id }, include: {
          course: true,
          orderUsedCoupons: whereActiveOrders,
          orderTrial: whereActiveOrders,
          orderReplacementFrom: whereActiveOrders,
          orderReplacementTo: whereActiveOrders,
        } }))
    )));
    // Any other course registration is assumed to be paid cash
    const paidCourseRegistrationIds = anyPurchasedCourseRegistrationIds.filter(id =>
      !(data.billing.existingCoupons?.some(c => c.courseRegistrationIds.includes(id))
        || data.billing.newCoupons?.some(c => c.courseRegistrationIds.includes(id))
        || data.billing.replacementCourseRegistrations?.some(r => r.toCourseRegistrationId === id)
        || data.billing.trialCourseRegistrationId === id)
    );

    const coupons = makeRecord(await Promise.all(
      (data.purchases.existingCoupons?.map(({ id }) => id) ?? []).concat(data.billing.existingCoupons?.map(a => a.couponId) ?? [])
    .map(id => prisma.coupon.findUniqueOrThrow({ where: { id }, include: { orderCourseRegistrations: whereActiveOrders, ordersPurchased: { where: activeArgs } } }))));
    const couponModels = makeRecord(await Promise.all(
      data.purchases.newCoupons?.map(({ couponModel: { id } }) => prisma.couponModel.findUniqueOrThrow({ where: { id } })) ?? []
    ));
    const membershipModels = makeRecord(await Promise.all(
      data.purchases.newMemberships?.map(({ membershipModelId: id }) => prisma.membershipModel.findUniqueOrThrow({ where: { id } })) ?? []
    ));
    const memberships = makeRecord(await Promise.all((data.purchases.existingMembershipIds ?? []).map(id => prisma.membership.findUniqueOrThrow({ where: { id }, include: { ordersPurchased: { where: activeArgs } } }))));

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
    if (anyPurchasedCourseRegistrationIds.map(id => courseRegistrations[id]).some(({ isUserCanceled }) => isUserCanceled)) {
      throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationNotRegistered);
    }
    const isPartOfOrder = (r: (typeof courseRegistrations)[number]): boolean => [r.orderUsedCoupons, r.orderTrial, r.orderReplacementTo].flat().length > 0;
    if (anyPurchasedCourseRegistrationIds.map(id => courseRegistrations[id]).some(r => isPartOfOrder(r))) {
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
    if (data.purchases.existingCoupons?.some(c => coupons[c.id].ordersPurchased.length > 0)) {
      throw new ServiceError(ServiceErrorCode.OrderCouponAlreadyOrdered);
    }

    // Membership (purchase)
    if (data.purchases.existingMembershipIds?.some(id => memberships[id].ordersPurchased.length > 0)) {
      throw new ServiceError(ServiceErrorCode.OrderMembershipAlreadyOrdered);
    }

    // ---

    // Total
    const sum = (array: number[]): number => array.reduce((a, b) => a + b, 0);

    const totalAmountCourses = sum(anyPurchasedCourseRegistrationIds.map(id => {
      if (data.billing.existingCoupons?.some(c => c.courseRegistrationIds.includes(id)) || data.billing.newCoupons?.some(c => c.courseRegistrationIds.includes(id))) {
        return 0; // Use coupon
      } else if (data.billing.replacementCourseRegistrations?.some(r => r.toCourseRegistrationId === id)) {
        return 0; // Use paid course as a replacement
      } else if (data.billing.trialCourseRegistrationId === id) {
        return 0; // Trial TODO custom price
      } else {
        return courseRegistrations[id].course.price;
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

    // ---

    const newCouponsCreated = await Promise.all(data.purchases.newCoupons?.map(c => createCoupon(prisma, { data: { couponModelId: c.couponModel.id, userId: user.id } })) ?? []);
    const newMembershipsCreated = await Promise.all(data.purchases.newMemberships?.map(m => createMembership(prisma, { data: { membershipModelId: m.membershipModelId, yearStart: m.year, users: [user.id] } })) ?? []);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        date: date,
        computedAmount: computedAmount,
        notes: data.notes,
        // Children
        usedCouponCourseRegistrations: {
          create:
            (data.billing.newCoupons?.flatMap(c => c.courseRegistrationIds.map(courseRegistrationId => ({ couponId: newCouponsCreated[c.newCouponIndex].id, courseRegistrationId }))) ?? [])
              .concat(data.billing.existingCoupons?.flatMap(c => c.courseRegistrationIds.map(courseRegistrationId => ({ couponId: c.couponId, courseRegistrationId }))) ?? []),
        },
        purchasedCoupons: {
          connect:
            (data.purchases.existingCoupons?.map(({ id }) => ({ id })) ?? [])
              .concat(newCouponsCreated.map(({ id }) => ({ id }))),
        },
        purchasedMemberships: {
          connect:
            (data.purchases.existingMembershipIds?.map(id => ({ id })) ?? [])
              .concat(newMembershipsCreated.map(({ id }) => ({ id }))),
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
        purchasedCourseRegistrations: {
          connect: paidCourseRegistrationIds.map(id => ({ id })),
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
  }, transactionOptions);
};

export const deleteOrder = async (args: { where: Prisma.OrderWhereUniqueInput }) => prisma.$transaction(async prisma =>
  prisma.order.update({ where: args.where, data: { active: false, transaction: { disconnect: true } } }),
  transactionOptions
);
