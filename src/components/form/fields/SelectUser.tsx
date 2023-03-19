import React from 'react';
import { AutocompleteElement } from 'react-hook-form-mui';
import { trpc } from '../../../common/trpc';
import { User } from '@prisma/client';
import { displayUserName } from '../../../common/display';

interface SelectUserProps {
  name: string;
  multiple?: boolean;
  noMatchId?: boolean;
  label?: string;
}

export const SelectUser: React.FC<SelectUserProps> = ({ name, multiple, noMatchId, label }) => {
  const { data, isLoading } = trpc.user.findAll.useQuery({ disabled: false });
  return (
    <AutocompleteElement
      name={name}
      options={data ? data.map(v => [displayUserName(v).toLowerCase(), v]).sort(([a,], [b,]) => a >= b ? 1 : -1).map(([_, v]) => v) : []}
      multiple={multiple}
      matchId={!noMatchId}
      label={label ?? `Utilisateur${multiple ? 's' : ''}`}
      loading={isLoading}
      autocompleteProps={{
        disabled: isLoading,
        getOptionLabel: (option: User | undefined) => option ? displayUserName(option) : '...',
        renderOption: (props, option: User | undefined) => option ? (
          <li {...props} key={option.id}>
            {displayUserName(option)}
          </li>
        ) : '...',
      }}
    />
  );
};
