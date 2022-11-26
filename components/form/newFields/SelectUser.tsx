import React from 'react';
import { AutocompleteElement } from 'react-hook-form-mui';
import { trpc } from '../../../lib/common/trpc';
import { User } from '@prisma/client';
import { displayUserName } from '../../../lib/common/display';

interface SelectUserProps {
  name: string;
  multiple?: boolean;
}

export const SelectUser: React.FC<SelectUserProps> = ({ name, multiple }) => {
  const { data, isLoading } = trpc.useQuery(['user.findAll']);
  return (
    <AutocompleteElement
      name={name}
      options={data ?? []}
      multiple={multiple}
      matchId
      label={`Utilisateur${multiple ? 's' : ''}`}
      loading={isLoading}
      autocompleteProps={{
        disabled: isLoading,
        getOptionLabel: (option: User | undefined) => option ? displayUserName(option) : '...',
      }}
    />
  );
};
