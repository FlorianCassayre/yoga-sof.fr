import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

import { APP_TIMEZONE } from '../../../util/date';
import type { CardStatus } from './CardStatus';

export const getCardStatus = (
  card: { canceled: boolean; remaining: number; validUntil: string },
  reference: Date = new Date(),
): CardStatus => {
  if (card.canceled) {
    return 'canceled';
  }
  if (card.remaining === 0) {
    return 'empty';
  }
  const today = format(new TZDate(reference, APP_TIMEZONE), 'yyyy-MM-dd');

  return card.validUntil < today ? 'expired' : 'active';
};
