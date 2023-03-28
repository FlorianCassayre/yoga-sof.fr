import React from 'react';
import { trpc } from '../../../common/trpc';
import { displayCouponModelName } from '../../../common/display';
import { AsyncSelect } from './AsyncSelect';
import { CouponModel } from '@prisma/client';

interface SelectCouponModelProps {
  name: string;
  multiple?: boolean;
  noMatchId?: boolean;
  label?: string;
}

export const SelectCouponModel: React.FC<SelectCouponModelProps> = ({ name, multiple, noMatchId, label }) => {
  return (
    <AsyncSelect
      name={name}
      multiple={multiple}
      noMatchId={noMatchId}
      label={label ?? `Type${multiple ? 's' : ''} de carte${multiple ? 's' : ''}`}
      renderOptionLabel={(option: CouponModel) => displayCouponModelName(option)}
      procedure={trpc.couponModel.findAll}
      input={undefined}
    />
  );
};
