import React from 'react';
import { trpc } from '../../../common/trpc';
import { displayMembershipModelName } from '../../../common/display';
import { AsyncSelect } from './AsyncSelect';

interface SelectMembershipModelProps {
  name: string;
  multiple?: boolean;
  label?: string;
  disabled?: boolean;
}

export const SelectMembershipModel: React.FC<SelectMembershipModelProps> = ({ name, multiple, label, disabled }) => {
  return (
    <AsyncSelect
      name={name}
      multiple={multiple}
      disabled={disabled}
      label={label ?? `Type${multiple ? 's' : ''} d'adhésion`}
      renderOptionLabel={displayMembershipModelName}
      procedure={trpc.membershipModel.findAll}
      input={undefined}
    />
  );
};
