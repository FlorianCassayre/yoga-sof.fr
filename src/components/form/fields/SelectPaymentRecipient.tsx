import React from 'react';
import { SelectEnum } from './SelectEnum';
import { PaymentRecipientNames } from '../../../common/payment';
import { PaymentRecipient } from '@prisma/client';

interface SelectPaymentRecipientProps {
  name: string;
}

export const SelectPaymentRecipient: React.FC<SelectPaymentRecipientProps> = ({ name }) => {
  return (
    <SelectEnum
      name={name}
      values={Object.keys(PaymentRecipient) as PaymentRecipient[]}
      labels={PaymentRecipientNames}
      label="Entité"
    />
  );
};
