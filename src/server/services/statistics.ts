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
  const payments = await (async () => {
    const payments = await prisma.orderPayment.findMany({ where: { order: { active: true } }, include: { order: { select: { date: true } } } });
    const otherPayments = await prisma.otherPayment.findMany({ select: { amountCents: true, recipient: true, date: true } });
    return [
      ...payments.map(({ amount, recipient, order: { date } }) => ({ amount, recipient, date })),
      ...otherPayments.map(({ amountCents, ...rest }) => ({ amount: amountCents / 100, ...rest })),
    ];
  })();

  if (payments.length === 0) {
    return { aggregation, data: [] };
  }
  const [dateMin, dateMax] = (() => {
    const dates =
      payments
        .map(({ date }) => date)
        .sort((d1, d2) => d1.getTime() - d2.getTime());
    return [dates[0], dates[dates.length - 1]];
  })();
  const actualDateMax = new Date();

  type Value = Record<PaymentRecipient, { incomes: number, expenses: number }>;
  const data: Record<string, Value> = {};
  const groupBy = aggregationOperators[aggregation], next = aggregationNext[aggregation];
  const initialValue = () => Object.fromEntries(Object.keys(PaymentRecipient).map(key => [key as PaymentRecipient, { incomes: 0, expenses: 0 }])) as Value;

  let date = dateMin;
  data[groupBy(date)] = initialValue();
  while (groupBy(date) < groupBy(actualDateMax)) {
    const nextDate = next(date);
    const key = groupBy(nextDate);
    data[key] = initialValue();
    date = nextDate;
  }

  payments.forEach(payment => {
    const key = groupBy(payment.date);
    data[key][payment.recipient][payment.amount >= 0 ? 'incomes' : 'expenses'] += Math.abs(payment.amount);
  });

  const sortedData = Object.entries(data).sort(([a], [b]) => a < b ? -1 : 1);
  return { aggregation, data: sortedData };
};

export const findPaymentsCategories = async ({ recipient }: { recipient?: PaymentRecipient } = {}) => {
  const payments = await (async () => {
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
    // Because prices can be customized (:anger:), the estimation is only approximate
    // To make it as fair as possible we weight each contribution proportionally
    const paymentsDecoupled = payments.flatMap(payment => {
      const
        weightCourseRegistrations =
          sum(payment.order.purchasedCourseRegistrations.map(r => r.course.price))
          + sum(payment.order.trialCourseRegistrations.map(t => t.price)),
        weightCoupons = sum(payment.order.purchasedCoupons.map(c => c.price)),
        weightMemberships = sum(payment.order.purchasedMemberships.map(m => m.price));
      const scale = payment.amount / (weightCourseRegistrations + weightCoupons + weightMemberships);

      return [
        { id: 'courseRegistration', name: 'Séances', amount: weightCourseRegistrations * scale },
        { id: 'coupon', name: 'Cartes', amount: weightCoupons * scale },
        { id: 'membership', name: 'Adhésions', amount: weightMemberships * scale },
      ];
    });

    const otherPayments = await prisma.otherPayment.findMany({ select: { category: { select: { id: true, name: true } }, amountCents: true }, where: { recipient } });

    return [
      ...paymentsDecoupled,
      ...otherPayments.map(({ category: { id, name }, amountCents }) =>
        ({ id: `other-${id}`, name, amount: amountCents / 100 })),
    ];
  })();

  type Aggregated = Record<string, { name: string, value: number }>;
  const total: { incomes: Aggregated, expenses: Aggregated } = { incomes: {}, expenses: {} };

  payments.forEach(({ id, name, amount }) => {
    const bucket = total[amount >= 0 ? 'incomes' : 'expenses'];
    if (bucket[id] === undefined) {
      bucket[id] = { name, value: 0 };
    }
    bucket[id].value += Math.abs(amount);
  });

  const flatten = (record: Record<string, { name: string, value: number }>) => Object.values(record)
    .filter(({ value }) => value > 0)
    .sort(({ value: v1 }, { value: v2 }) => v2 - v1)

  return { incomes: flatten(total.incomes), expenses: flatten(total.expenses) };
};
