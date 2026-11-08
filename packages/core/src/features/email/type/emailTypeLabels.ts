import type { EmailType } from './EmailType';

export const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  sessionCanceled: 'Annulation de séance',
  sessionReminderNewcomer: 'Rappel de séance pour nouveaux arrivants',
  sessionRegistration: 'Inscription à des séances',
  orderCreated: 'Confirmation de paiement',
  courseWaitingList: 'Place disponible pour une séance',
  other: 'Autre',
};
