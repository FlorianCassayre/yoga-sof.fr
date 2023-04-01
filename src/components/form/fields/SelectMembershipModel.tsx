import React from 'react';
import { trpc } from '../../../common/trpc';
import { displayMembershipModelName } from '../../../common/display';
import { AsyncSelect } from './AsyncSelect';

interface SelectMembershipModelProps {
  name: string;
  multiple?: boolean;
  label?: string;
  noMatchId?: boolean;
  disabled?: boolean;
}

export const SelectMembershipModel: React.FC<SelectMembershipModelProps> = ({ name, multiple, label, noMatchId, disabled }) => {
  return (
    <AsyncSelect
      name={name}
      multiple={multiple}
      noMatchId={noMatchId}
      disabled={disabled}
      label={label ?? `Type${multiple ? 's' : ''} d'adhésion`}
      renderOptionLabel={displayMembershipModelName}
      procedure={trpc.membershipModel.findAll}
      input={undefined}
    />
  );
};
