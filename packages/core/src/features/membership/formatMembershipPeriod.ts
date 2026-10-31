import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

import { APP_TIMEZONE, appLocale } from '../../util/date';

const formatDay = (date: string): string => {
  const [year = 0, month = 0, day = 0] = date.split('-').map(Number);

  return format(new TZDate(year, month - 1, day, APP_TIMEZONE), 'd MMMM yyyy', {
    locale: appLocale,
  });
};

export const formatMembershipPeriod = ({
  startsAt,
  endsAt,
}: {
  startsAt: string;
  endsAt: string;
}): string => `${formatDay(startsAt)} au ${formatDay(endsAt)}`;
