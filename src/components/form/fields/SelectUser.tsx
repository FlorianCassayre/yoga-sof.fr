import React from 'react';
import { trpc } from '../../../common/trpc';
import { displayUserName } from '../../../common/display';
import { AsyncSelect } from './AsyncSelect';

interface SelectUserProps {
  name: string;
  multiple?: boolean;
  label?: string;
}

export const SelectUser: React.FC<SelectUserProps> = ({ name, multiple, label }) => {
  return (
    <AsyncSelect
      name={name}
      multiple={multiple}
      label={label ?? `Utilisateur${multiple ? 's' : ''}`}
      renderOptionLabel={displayUserName}
      procedure={trpc.user.findAll}
      input={undefined}
    />
  );
};
