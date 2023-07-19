import { prisma } from '../prisma';
import { PaymentRecipient } from '@prisma/client';

const sum = (array: number[]): number => array.reduce((a, b) => a + b, 0);

export enum DateAggregationType {
  Month = 'month',
  Year = 'year',
}

const aggregationNext: Record<DateAggregationType, (date: Date) => Date> = {
  [DateAggregationType.Month]: date => {
    const copy = new Date(date);
    copy.setMonth(date.getMonth() + 1);
    return copy;
  },
  [DateAggregationType.Year]: date => {
    const copy = new Date(date);
    copy.setFullYear(date.getFullYear() + 1);
    return copy;
  },
};

const aggregationOperators: Record<DateAggregationType, (date: Date) => string> = {
  [DateAggregationType.Month]: date => [date.getFullYear(), (date.getMonth() + 1).toString().padStart(2, '0')].join('-'),
  [DateAggregationType.Year]: date => date.getFullYear().toString(),
};

export const findAggregatedPayments = async ({ aggregation }: { aggregation: DateAggregationType }) => {
  const payments = await prisma.orderPayment.findMany({ where: { order: { active: true } }, include: { order: { select: { date: true } } } });
  if (payments.length === 0) {
    return { aggregation, data: [] };
  }
  const [dateMin, dateMax] = (() => {
    const dates =
      payments
        .map(({ order: { date } }) => date)
        .sort((d1, d2) => d1.getTime() - d2.getTime());
    return [dates[0], dates[dates.length - 1]];
  })();
  const actualDateMax = new Date();

  const data: Record<string, Record<PaymentRecipient, number>> = {};
  const groupBy = aggregationOperators[aggregation], next = aggregationNext[aggregation];
  const initialValue = () => Object.fromEntries(Object.keys(PaymentRecipient).map(key => [key as PaymentRecipient, 0])) as Record<PaymentRecipient, number>;

  let date = dateMin;
  data[groupBy(date)] = initialValue();
  while (groupBy(date) < groupBy(actualDateMax)) {
    const nextDate = next(date);
    const key = groupBy(nextDate);
    data[key] = initialValue();
    date = nextDate;
  }

  payments.forEach(payment => {
    const key = groupBy(payment.order.date);
    data[key][payment.recipient] += payment.amount;
  });

  const sortedData = Object.entries(data).sort(([a], [b]) => a < b ? -1 : 1);
  return { aggregation, data: sortedData };
};

export const findPaymentsCategories = async ({ recipient }: { recipient?: PaymentRecipient } = {}) => {
  const payments = await prisma.orderPayment.findMany({
    where: { recipient, order: { active: true } },
    include: {
      order: {
        include: {
          purchasedCourseRegistrations: { select: { course: { select: { price: true } } } },
          trialCourseRegistrations: { select: { price: true } },
          purchasedCoupons: { select: { price: true } },
          purchasedMemberships: { select: { price: true } },
        },
      },
    },
  });
  const total = {
    courseRegistrations: 0,
    coupons: 0,
    memberships: 0,
  };
  if (payments.length === 0) {
    return total;
  }

  // Because prices can be customized (:anger:), the estimation is only approximate
  // To make it as fair as possible we weight each contribution proportionally
  payments.forEach(payment => {
    const
      weightCourseRegistrations =
        sum(payment.order.purchasedCourseRegistrations.map(r => r.course.price))
        + sum(payment.order.trialCourseRegistrations.map(t => t.price)),
      weightCoupons = sum(payment.order.purchasedCoupons.map(c => c.price)),
      weightMemberships = sum(payment.order.purchasedMemberships.map(m => m.price));
    const scale = payment.amount / (weightCourseRegistrations + weightCoupons + weightMemberships);

    total.courseRegistrations += weightCourseRegistrations * scale;
    total.coupons += weightCoupons * scale;
    total.memberships += weightMemberships * scale;
  });

  return total;
};
