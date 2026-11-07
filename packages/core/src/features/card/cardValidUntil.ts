import { TZDate } from '@date-fns/tz';
import { addMonths, format, subDays } from 'date-fns';

import { APP_TIMEZONE } from '../../util/date';

export const cardValidUntil = ({
  purchasedAt,
  months,
}: {
  purchasedAt: Date;
  months: number;
}): string => {
  const purchased = new TZDate(purchasedAt, APP_TIMEZONE);
  const validUntil = subDays(
    addMonths(
      new TZDate(purchased.getFullYear(), purchased.getMonth(), purchased.getDate(), APP_TIMEZONE),
      months,
    ),
    1,
  );

  return format(validUntil, 'yyyy-MM-dd');
};
