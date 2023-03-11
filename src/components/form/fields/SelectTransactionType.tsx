import React from 'react';
import { TransactionType } from '@prisma/client';
import { TransactionTypeNames } from '../../../common/transaction';
import { SelectElement } from 'react-hook-form-mui';

interface SelectTransactionTypeProps {
  name: string;
  disabled?: boolean;
}

export const SelectTransactionType: React.FC<SelectTransactionTypeProps> = ({ name, disabled }) => {
  return (
    <SelectElement
      name={name}
      options={Object.keys(TransactionType).map(key => ({
        id: key,
        label: TransactionTypeNames[key as keyof typeof TransactionType],
      }))}
      label="Moyen de paiement"
      disabled={disabled}
      fullWidth
    />
  );
};
