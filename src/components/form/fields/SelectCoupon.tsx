import React from 'react';
import { trpc } from '../../../common/trpc';
import { displayCouponNameWithQuantity } from '../../../common/display';
import { AsyncSelect } from './AsyncSelect';

interface SelectCouponProps {
  name: string;
  userId: number;
  noOrder?: boolean;
  notEmpty?: boolean;
  multiple?: boolean;
  noMatchId?: boolean;
  label?: string;
}

export const SelectCoupon: React.FC<SelectCouponProps> = ({ name, userId, noOrder, notEmpty, multiple, noMatchId, label }) => {
  return (
    <AsyncSelect
      name={name}
      multiple={multiple}
      noMatchId={noMatchId}
      label={label ?? `Carte${multiple ? 's' : ''}`}
      renderOptionLabel={(option: any) => displayCouponNameWithQuantity(option)}
      procedure={trpc.coupon.findAll}
      input={{ userId, noOrder, notEmpty }}
    />
  );
};
