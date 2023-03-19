import React from 'react';
import { trpc } from '../../../common/trpc';
import { displayCouponModelName, displayCouponName } from '../../../common/display';
import { AsyncSelect } from './AsyncSelect';
import { CouponModel } from '@prisma/client';

interface SelectCouponProps {
  name: string;
  userId: number;
  multiple?: boolean;
  noMatchId?: boolean;
  label?: string;
}

export const SelectCoupon: React.FC<SelectCouponProps> = ({ name, userId, multiple, noMatchId, label }) => {
  return (
    <AsyncSelect
      name={name}
      multiple={multiple}
      noMatchId={noMatchId}
      label={label ?? `Carte${multiple ? 's' : ''}`}
      renderOptionLabel={(option: CouponModel) => displayCouponName(option)}
      procedure={trpc.coupon.findAll}
      input={{ userId }}
    />
  );
};
