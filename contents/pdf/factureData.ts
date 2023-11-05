import { FactureProps } from './facture';
import { OrderItemType } from '../../src/common/order';

export const INVOICE_TRANSMITTER: FactureProps['transmitter'] = {
  organization: 'Yoga-Sof',
  website: 'https://yoga-sof.fr',
  fullname: 'Sophie Richaud-Cassayre EI',
  address: ['8 rue des moissonneurs', '68220 Hésingue'],
  phone: '06 58 4' + '8 33 45',
  email: process.env.EMAIL_REPLY_TO,
};

export const INVOICE_INSURANCE: FactureProps['insurance'] =
  'Assurance AXA';

export const INVOICE_SIRET_NUMBER: FactureProps['siret'] =
  '980 822 340 00017';

export const INVOICE_ORDER_REMARKS: Partial<Record<OrderItemType, { short: string, detailed: string }>> = {
  [OrderItemType.Membership]: { short: 'Période indiquée', detailed: `L'adhésion dure un an et est valable pour la période indiquée. L'adhésion est nominative.` },
  [OrderItemType.Coupon]: { short: '12 mois', detailed: `La carte est valable 12 mois à compter de la date d'émission de cette facture. La carte est nominative et ne peut pas être utilisée par d'autres personnes.` },
  [OrderItemType.CourseNormal]: { short: '3 mois', detailed: `La séance est valable pour la date et heure indiquées. Il est possible de la reporter pour une autre séance ayant lieu au maximum 3 mois après la date initiale (sous conditions). La séance reportée ne peut pas être cédée à une autre personne.` },
};
