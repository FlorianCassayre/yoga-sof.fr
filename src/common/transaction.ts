import { TransactionType } from '@prisma/client';

export const TransactionTypeNames: { [K in TransactionType]: string } = {
  [TransactionType.CASH]: 'Espèces',
  [TransactionType.HELLO_ASSO]: 'HelloAsso',
  [TransactionType.CHECK]: 'Chèque',
  [TransactionType.TRANSFER]: 'Virement',
}
