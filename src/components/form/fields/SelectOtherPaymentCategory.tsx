import React from 'react';
import { trpc } from '../../../common/trpc';
import { displayOtherPaymentCategoryName } from '../../../common/display';
import { AsyncSelect } from './AsyncSelect';

interface SelectOtherPaymentCategoryProps {
  name: string;
}

export const SelectOtherPaymentCategory: React.FC<SelectOtherPaymentCategoryProps> = ({ name }) => {
  return (
    <AsyncSelect
      name={name}
      noMatchId
      label="Catégorie"
      renderOptionLabel={({ name }: any) => displayOtherPaymentCategoryName({ name })}
      procedure={trpc.otherPaymentCategory.findAll}
      input={undefined}
    />
  );
};
