import type { CardStatus } from './CardStatus';

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  active: 'Active',
  canceled: 'Annulée',
  empty: 'Vide',
  expired: 'Expirée',
};
