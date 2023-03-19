import React from 'react';
import { trpc } from '../../../common/trpc';
import { displayMembershipName } from '../../../common/display';
import { AsyncSelect } from './AsyncSelect';
import { Membership } from '@prisma/client';

interface SelectMembershipProps {
  name: string;
  userId?: number;
  multiple?: boolean;
  label?: string;
  noMatchId?: boolean;
  disabled?: boolean;
}

export const SelectMembership: React.FC<SelectMembershipProps> = ({ name, userId, multiple, label, noMatchId, disabled }) => {
  return (
    <AsyncSelect
      name={name}
      multiple={multiple}
      noMatchId={noMatchId}
      disabled={disabled}
      label={label ?? `Cotisation${multiple ? 's' : ''}`}
      renderOptionLabel={(option: any) => displayMembershipName(option)}
      procedure={trpc.membership.findAll}
      input={{ userId }}
    />
  );
};
