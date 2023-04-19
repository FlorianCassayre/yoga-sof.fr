import { z } from 'zod';
import { prisma, writeTransaction } from '../prisma';
import { orderCreateSchema, orderUpdateSchema } from '../../common/schemas/order';
import { Prisma } from '@prisma/client';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { createCoupon, findCoupons } from './coupon';
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

export const createOrder = async (prisma: Prisma.TransactionClient, args: { data: z.infer<typeof orderCreateSchema> }) => {
  orderCreateSchema.parse(args.data);

  // Remark: we don't check if the registration belong to the user because it is allowed (even though the UI doesn't permit it yet)

  const makeRecord = <T extends number | string, O extends { id: T }>(array: O[]): Record<T, O> =>
    Object.fromEntries(array.map(o => [o.id, o])) as any;

  const { data } = args;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: data.user.id } });
  const transaction = data.billing.transaction !== undefined ? await prisma.transaction.findUniqueOrThrow({ where: { id: data.billing.transaction.id } }) : null;

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
        orderPurchased: { where: activeArgs },
      } }))
  )));
  // Any other course registration is assumed to be paid cash
  const paidCourseRegistrationIds = anyPurchasedCourseRegistrationIds.filter(id =>
    !(data.billing.existingCoupons?.some(c => c.courseRegistrationIds.includes(id))
      || data.billing.newCoupons?.some(c => c.courseRegistrationIds.includes(id))
      || data.billing.replacementCourseRegistrations?.some(r => r.toCourseRegistrationId === id)
      || data.billing.trialCourseRegistration?.courseRegistrationId === id)
  );

  const coupons = makeRecord(await Promise.all(
    (data.purchases.existingCoupons?.map(({ id }) => id) ?? []).concat(data.billing.existingCoupons?.map(e => e.coupon.id) ?? [])
  .map(id => prisma.coupon.findUniqueOrThrow({ where: { id }, include: { orderCourseRegistrations: whereActiveOrders, ordersPurchased: { where: activeArgs } } }))));
  const couponModels = makeRecord(await Promise.all(
    data.purchases.newCoupons?.map(({ couponModel: { id } }) => prisma.couponModel.findUniqueOrThrow({ where: { id } })) ?? []
  ));
  const membershipModels = makeRecord(await Promise.all(
    data.purchases.newMemberships?.map(({ membershipModel: { id } }) => prisma.membershipModel.findUniqueOrThrow({ where: { id } })) ?? []
  ));
  const memberships = makeRecord(await Promise.all((data.purchases.existingMemberships ?? []).map(({ id }) => prisma.membership.findUniqueOrThrow({ where: { id }, include: { ordersPurchased: { where: activeArgs } } }))));

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
  const isPartOfOrder = (r: (typeof courseRegistrations)[number]): boolean => [r.orderUsedCoupons, r.orderTrial, r.orderReplacementTo, r.orderPurchased].flat().length > 0;
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
  if (data.billing.existingCoupons?.some(c => coupons[c.coupon.id].orderCourseRegistrations.length + c.courseRegistrationIds.length > coupons[c.coupon.id].quantity)) {
    throw new ServiceError(ServiceErrorCode.OrderCourseRegistrationCouponFull);
  }

  // Coupons (purchase)
  if (data.purchases.existingCoupons?.some(c => coupons[c.id].ordersPurchased.length > 0)) {
    throw new ServiceError(ServiceErrorCode.OrderCouponAlreadyOrdered);
  }

  // Membership (purchase)
  if (data.purchases.existingMemberships?.some(({ id }) => memberships[id].ordersPurchased.length > 0)) {
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
    } else if (data.billing.trialCourseRegistration?.courseRegistrationId === id) {
      return data.billing.trialCourseRegistration.newPrice; // Trial
    } else {
      return courseRegistrations[id].course.price;
    }
  }));
  const totalAmountCoupons = sum(
    (data.purchases.existingCoupons?.map(({ id }) => coupons[id].price) ?? [])
      .concat(data.purchases.newCoupons?.map(c => couponModels[c.couponModel.id].price) ?? [])
  );
  const totalAmountMemberships = sum(
    (data.purchases.existingMemberships?.map(({ id }) => memberships[id].price) ?? [])
      .concat(data.purchases.newMemberships?.map(m => membershipModels[m.membershipModel.id].price) ?? [])
  )
  const computedAmount = totalAmountCourses + totalAmountCoupons + totalAmountMemberships;

  // The date is always defined (by default it is the current day). For transactions, it's not used (not shown in the UI), but still defined
  const date = transaction?.date ?? data.billing.date;

  const amountPaid = transaction?.amount ?? (data.billing.newPayment ? (data.billing.newPayment?.overrideAmount ? data.billing?.newPayment?.amount : computedAmount) : 0) ?? 0;
  if (
    (transaction === null || !data.billing.forceTransaction)
    && amountPaid !== computedAmount && !data.billing.newPayment?.overrideAmount
  ) { // If no override, check that the payment corresponds to the amount
    throw new ServiceError(ServiceErrorCode.OrderPaymentAmountMismatch);
  }

  // ---

  const newCouponsCreated = await Promise.all(data.purchases.newCoupons?.map(c => createCoupon(prisma, { data: { couponModelId: c.couponModel.id, userId: user.id } })) ?? []);
  const newMembershipsCreated = await Promise.all(data.purchases.newMemberships?.map(m => createMembership(prisma, { data: { membershipModelId: m.membershipModel.id, yearStart: m.year, users: [user.id] } })) ?? []);

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
            .concat(data.billing.existingCoupons?.flatMap(c => c.courseRegistrationIds.map(courseRegistrationId => ({ couponId: c.coupon.id, courseRegistrationId }))) ?? []),
      },
      purchasedCoupons: {
        connect:
          (data.purchases.existingCoupons?.map(({ id }) => ({ id })) ?? [])
            .concat(newCouponsCreated.map(({ id }) => ({ id }))),
      },
      purchasedMemberships: {
        connect:
          (data.purchases.existingMemberships?.map(({ id }) => ({ id })) ?? [])
            .concat(newMembershipsCreated.map(({ id }) => ({ id }))),
      },
      trialCourseRegistrations: {
        create: data.billing.trialCourseRegistration !== undefined ? [{
          courseRegistrationId: data.billing.trialCourseRegistration.courseRegistrationId,
          price: data.billing.trialCourseRegistration.newPrice,
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
      } : data.billing.newPayment && amountPaid > 0 ? {
        create: {
          amount: amountPaid, // Take into account the override
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
};

export const updateOrder = async (args: { where: Prisma.OrderWhereUniqueInput, data: Omit<z.infer<typeof orderUpdateSchema>, 'id'> }) => writeTransaction(async prisma => {
  orderUpdateSchema.parse({ ...args.where, ...args.data });
  return prisma.order.update({ where: args.where, data: args.data });
});

export const deleteOrder = async (args: { where: Prisma.OrderWhereUniqueInput }) => writeTransaction(async prisma =>
  prisma.order.update({ where: args.where, data: { active: false, transaction: { disconnect: true } } })
);

export const createOrderAutomatically = async (args: { where: { courseRegistrationId: number } }) => writeTransaction(async prisma => {
  const courseRegistration = await prisma.courseRegistration.findUniqueOrThrow({ where: { id: args.where.courseRegistrationId } });
  const coupon = (await findCoupons({ where: { includeDisabled: false, userId: courseRegistration.userId } })).filter(c => c.orderCourseRegistrations.length < c.quantity).sort((a, b) => b.orderCourseRegistrations.length - a.orderCourseRegistrations.length)[0];
  if (coupon === undefined) {
    throw new ServiceError(ServiceErrorCode.UserHasNoCoupons);
  }
  return createOrder(prisma, {
    data: {
      user: { id: courseRegistration.userId },
      purchases: {
        courseRegistrations: [{ id: courseRegistration.id }],
      },
      billing: {
        existingCoupons: [{
          coupon: { id: coupon.id },
          courseRegistrationIds: [courseRegistration.id],
        }],
        date: new Date(),
      },
    },
  });
});
