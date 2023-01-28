import { prisma } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { Coupon, Course, CreditOfferType, Membership, MembershipType } from '@prisma/client';
import { computeNewMembershipsForDates } from './membership';

// TODO may have to design something more clever for determinism
const sortObjectAndArraysRecursively = (obj: object): object => {
  if (Array.isArray(obj)) { // Array
    return obj
      .map(entry => sortObjectAndArraysRecursively(entry))
      .sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1); // Not very efficient (quadratic) but good enough
  } else { // Object
    return Object.fromEntries(
      Object
        .entries(obj)
        .sort(([a], [b]) => a < b ? -1 : 1)
        .map(([key, value]) => [key, sortObjectAndArraysRecursively(value)])
    );
  }
};

interface SimulateOrderBasePayload {
  userId: number;
  coupons: Partial<Record<MembershipType, number>>; // Only the new coupons
  claimsHasDoneTrial: boolean;
  preferredMembershipType: MembershipType;
}

// Used to display the estimation before confirmation
// We may also be interested in checking that this value stays the same between the time it is shown to the user and the time the user confirms the registration
interface SimulateOrderUnregisteredPayload extends SimulateOrderBasePayload {
  courses: number[];
}

// Used to compute the due amount and later generate a checkout intent
// We must enforce this value to stay the same between the time it is shown to the user and the time the user generates the checkout intent
interface SimulateOrderRegisteredPayload extends SimulateOrderBasePayload {
  coursesRegistrations: number[];
}

interface SimulateOrderResult {
  content: {
    courses: Pick<Course, 'id' | 'type' | 'price'>[],
    coupons: ({
      id?: number, // In case the order was refunded, the coupon already exists
    } & Pick<Coupon, 'courseType' | 'quantity' | 'price'>)[],
    memberships: ({
      id?: number, // Same here
    } & Pick<Membership, 'type' | 'dateStart' | 'dateEnd' | 'price'>)[],
  },
  payment: {
    coupons: {
      coupons: ({
        id?: number, // The coupons that do not exist are the ones that are going to be purchased
      } & Pick<Coupon, 'courseType' | 'quantity' | 'price'>)[],
      quantityToUse: number,
      amount: number,
    }[],
    registrations: {
      id: number,
      amount: number,
    }[],
    offers: {
      type: CreditOfferType,
      amount: number,
    }[],
    remainingAmount: number,
  },
}

export const simulateOrderBeforeRegistration = async ({

}: SimulateOrderUnregisteredPayload) => {

};

// TODO remove this type
type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

/*
Registration is canceled:
Course is canceled:
Order is marked as deleted:

 */
export const simulateOrder = async ({
  userId,
  coursesRegistrations,
  coupons,
  claimsHasDoneTrial,
  preferredMembershipType,
}: SimulateOrderRegisteredPayload): Promise<RecursivePartial<SimulateOrderResult>> => { // FIXME (temporary type)
  return await prisma.$transaction(async () => {
    const userAsync = prisma.user.findUniqueOrThrow({ where: { id: userId } });
    // Make sure the user exists
    const user = await userAsync;
    // TODO uniqueness
    const purchasedCourseRegistrations = await Promise.all(coursesRegistrations.map(id =>
      // This will have to updated when users will be allowed to manage other users
      prisma.courseRegistration.findFirstOrThrow({ where: { id, userId }, include: { course: true, orders: true } })
    ));
    //const purchasedCoupons = await Promise.all(Object.entries(coupons).map(([type, count]) => null)) // TODO

    if (purchasedCourseRegistrations.some(registration => registration.course.isCanceled)) {
      throw new ServiceError(ServiceErrorCode.OrderCourseCanceled);
    }
    if (purchasedCourseRegistrations.some(registration => registration.isUserCanceled)) {
      throw new ServiceError(ServiceErrorCode.OrderRegistrationCanceled);
    }
    if (purchasedCourseRegistrations.some(registration => registration.orders.some(order => !order.refunded))) {
      throw new ServiceError(ServiceErrorCode.OrderRegistrationAlreadyInOrder);
    }

    const allUnpaidCourseRegistrations = await prisma.courseRegistration.findMany({ where: { userId, orders: { every: { refunded: false } } }, select: { course: { select: { dateStart: true } } } });
    const allUnpaidCourseDates = allUnpaidCourseRegistrations.map(({ course: { dateStart } }) => dateStart);

    const existingUnpaidCoupons = await prisma.coupon.findMany({ where: { userId, orders: { every: { refunded: false } } } });

    const existingUnpaidMemberships = await userAsync.memberships({ where: { orders: { every: { refunded: false } } } });
    // v This will change later when people will be able to register more people TODO
    const newMembershipsType = preferredMembershipType;
    const membershipModel = await prisma.membershipModel.findUnique({ where: { id: newMembershipsType } });
    const membershipsToCreate =
      membershipModel !== null ?
        (await computeNewMembershipsForDates({ where: { userId }, data: { dates: allUnpaidCourseDates, latestDate: new Date() } }))
          .map(([dateStart, dateEnd]) => ({ type: newMembershipsType, dateStart, dateEnd, price: membershipModel.price })) :
        [];

    // Order of priority of sources for paying an order:
    // 1. Use any paid registration that was canceled (or for which the course was canceled)
    // 2. Apply any available offer
    // 3. Use the owned coupons
    // 4. Use the coupons that will be purchased
    // 5. Any remaining amount will have to be paid by cash or HelloAsso

    // TODO

    return {
      content: {
        courses: purchasedCourseRegistrations.map(({ course: { id, type, price } }) => ({ id, type, price })),
        coupons: [], // TODO
        memberships: [
          ...existingUnpaidMemberships.map(({ id, type, dateStart, dateEnd, price }) => ({ id, type, dateStart, dateEnd, price })),
          ...membershipsToCreate,
        ],
      },
      payment: {
        coupons: [], // TODO
        registrations: [], // TODO
        offers: [], // TODO
      },
    };
  });
};

interface CreateOrderPayload extends SimulateOrderPayload {
  simulated?: any;
}

export const createOrder = async ({
  simulated,
  ...rest
}: CreateOrderPayload) => {
  const { userId, coursesRegistrations, memberships, coupons } = rest;
  return await prisma.$transaction(async () => {
    if (simulated) {
      const actualSimulation = await simulateOrder(rest);
      // TODO compare
      if (false) {
        throw new ServiceError(ServiceErrorCode.OrderSimulationMismatch);
      }
    }


  });
};

