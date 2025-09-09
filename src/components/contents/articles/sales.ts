import { WeekdayNames } from '../../../common/date';

interface GaufresContentData {
  items: {
    code: string;
    label: string;
    price: number;
  }[];
  saleCodes: string[];
  saleTimes: (string | null)[];
  saleDays: {
    day: string;
    timeLabel: string;
    startIndex: number;
  }[];
  halfDays: {
    cashAmounts: number[];
    cash: number[][];
    couponAmounts: number[];
    coupons: number[][];
  };
  days: {
    donations: number[];
    owed: number[];
  };
  expenses: number[];
}

export interface GaufresProcessedData {
  totalSold: number;
  totalSoldEuro: number;
  totalProfitsEuro: number;
  days: {
    date: string;
    totalEuro: number;
    totalSoldDay: number;
    totalSoldPerTime: { time: string, count: number }[];
    itemsSold: { count: number; label: string }[];
  }[];
}

export const parseGaufresDataContent = (data: GaufresContentData): GaufresProcessedData => {
  if (new Set([data.saleCodes, data.saleTimes].map(array => array.length)).size !== 1) {
    throw new Error();
  }
  // More validation could be done

  const itemsByCode = Object.fromEntries(data.items.map(item => [item.code, item]));
  const sold = data.saleCodes.map(code => itemsByCode[code]);
  //const totalSoldEuroEstimated = sum(sold.map(item => item.price));
  const totalExpenses = sum(data.expenses);

  const cashPerHalfDay = data.halfDays.cash.map(cashContent => sum(cashContent.map((count, i) => data.halfDays.cashAmounts[i] * count)));
  const couponsPerHalfDay = data.halfDays.coupons.map(couponsContent => sum(couponsContent.map((count, i) => data.halfDays.couponAmounts[i] * count)));

  const days = data.saleDays.map((day, i) => {
    const morning = i * 2, evening = morning + 1;
    const endIndexExclusive = i < data.saleDays.length - 1 ? data.saleDays[i + 1].startIndex : data.saleCodes.length;
    const soldDay = sold.slice(day.startIndex, endIndexExclusive);
    const totalSoldDay = soldDay.length;
    const cashEuro = cashPerHalfDay[evening] - cashPerHalfDay[morning];
    const couponsEuro = couponsPerHalfDay[i * 2 + 1] - couponsPerHalfDay[i * 2];
    const totalSoldPerTime = data.saleTimes.slice(day.startIndex, endIndexExclusive)
      .map((time, i) => ({ time, count: i }))
      .filter((e): e is { time: string, count: number } => e.time !== null);
    const codeToIndex = Object.fromEntries(data.items.map((item, i) => [item.code, i]));
    const typesSold = data.items.map(() => 0);
    soldDay.forEach(sold => typesSold[codeToIndex[sold.code]]++);
    const typesSoldWithItem = data.items.map((item, i) => ({ label: `${item.label} (${formatEuro(item.price, false)})`, count: typesSold[i] }));
    return {
      date: `${WeekdayNames[(new Date(day.day).getDay() + WeekdayNames.length - 1) % WeekdayNames.length]} (${day.timeLabel})`,
      totalEuro: cashEuro + couponsEuro + data.days.owed[i],
      totalSoldDay,
      totalSoldPerTime,
      itemsSold: typesSoldWithItem,
    };
  });
  const totalSoldEuro = sum(days.map(day => day.totalEuro))

  return {
    totalSold: data.saleCodes.length,
    totalSoldEuro,
    totalProfitsEuro: totalSoldEuro - totalExpenses,
    days,
  };
};

const sum = (array: number[]): number => array.reduce((a, b) => a + b, 0);

export const formatEuro = (euro: number, fixed: boolean = true): string => `${fixed || Math.round(euro) !== euro ? euro.toFixed(2).replace('.', ',') : euro} €`;
