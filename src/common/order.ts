import type { Prisma } from '@prisma/client';
import { displayCouponName, displayMembershipName } from './display';
import type { findOrder } from '../server/services/order';

export enum OrderItemType {
  Membership,
  Coupon,
  CourseNormal,
  CourseCoupon,
  CourseTrial,
  CourseReplacement,
}

interface OrderItem<T> {
  type: OrderItemType;
  item: T | string;
  oldPrice?: number;
  price: number;
  discount?: T | string;
}

type CourseRegistrationWithCourse = Prisma.CourseRegistrationGetPayload<{ include: { course: true } }>;

interface OrderItemOptions<T> {
  formatItemCourseRegistration: (courseRegistration: CourseRegistrationWithCourse) => T | string;
  formatDiscountCourseRegistrationReplacement: (courseRegistration: CourseRegistrationWithCourse) => T | string;
}

export const orderToItems = <T>(order: Awaited<ReturnType<typeof findOrder>>, options: OrderItemOptions<T>): OrderItem<T>[] => {
  const makeCourseRegistrationsTableData =
    (items: (Omit<OrderItem<T>, 'item'> & { courseRegistration: CourseRegistrationWithCourse })[]): OrderItem<T>[] =>
      [...items]
        .sort(({ courseRegistration: { course: { dateStart: a } } }, { courseRegistration: { course: { dateStart: b } } }) => a.getTime() - b.getTime())
        .map(({ courseRegistration, ...item }) => ({
          item: options.formatItemCourseRegistration(courseRegistration),
          ...item,
        }));
  return [
    ...[...order.purchasedMemberships]
      .sort(({ dateStart: a }, { dateStart: b }) => a.getTime() - b.getTime())
      .map(m => ({
        type: OrderItemType.Membership,
        item: displayMembershipName(m),
        price: m.price,
      })),
    ...[...order.purchasedCoupons]
      .sort(({ createdAt: a }, { createdAt: b }) => a.getTime() - b.getTime())
      .map(c => ({
        type: OrderItemType.Coupon,
        item: displayCouponName(c),
        price: c.price,
      })),
    ...makeCourseRegistrationsTableData([
      ...order.purchasedCourseRegistrations.map(r => ({
        type: OrderItemType.CourseNormal,
        courseRegistration: r,
        price: r.course.price,
      })),
      ...order.usedCouponCourseRegistrations.map(({ courseRegistration, coupon }) => ({
        type: OrderItemType.CourseCoupon,
        courseRegistration,
        oldPrice: courseRegistration.course.price,
        price: 0,
        discount: displayCouponName(coupon),
      })),
      ...order.trialCourseRegistrations.map(({ courseRegistration, price }) => ({
        type: OrderItemType.CourseTrial,
        courseRegistration,
        oldPrice: courseRegistration.course.price,
        price: price,
        discount: `Séance d'essai`,
      })),
      ...order.replacementCourseRegistrations.map(({ fromCourseRegistration, toCourseRegistration }) => ({
        type: OrderItemType.CourseReplacement,
        courseRegistration: toCourseRegistration,
        oldPrice: toCourseRegistration.course.price,
        price: 0,
        discount: options.formatDiscountCourseRegistrationReplacement(fromCourseRegistration),
      }))
    ]),
  ];
}
