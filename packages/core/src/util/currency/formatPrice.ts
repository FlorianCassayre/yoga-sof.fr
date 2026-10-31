import { appLocaleTag } from '../../util/date';

const priceFormatter = new Intl.NumberFormat(appLocaleTag, {
  style: 'currency',
  currency: 'EUR',
});

export const formatPrice = (cents: number): string => priceFormatter.format(cents / 100);
