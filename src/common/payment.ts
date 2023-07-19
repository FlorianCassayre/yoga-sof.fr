import { PaymentRecipient } from '@prisma/client';

export const PaymentRecipientNames: { [K in PaymentRecipient]: string } = {
  [PaymentRecipient.ORGANIZATION]: 'Association',
  [PaymentRecipient.ENTERPRISE]: 'Autoentreprise',
};
