import { EmailMessageType } from '@prisma/client';

export const EmailMessageTypeNames: { [K in EmailMessageType]: string } = {
  [EmailMessageType.SESSION_CANCELED]: 'Annulation de cours',
  [EmailMessageType.SESSION_REMINDER_NEWCOMER]: 'Rappel de séance pour les nouveaux arrivants',
  [EmailMessageType.SESSION_REGISTRATION]: `Confirmation d'inscription à des séances`,
  [EmailMessageType.OTHER]: 'Autre',
};
