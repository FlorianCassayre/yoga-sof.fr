import React from 'react';
import { AutocompleteElement } from 'react-hook-form-mui';
import { trpc } from '../../../common/trpc';
import { Transaction } from '@prisma/client';
import { displayTransactionWithDate } from '../../../common/display';

interface SelectTransactionProps {
  name: string;
  userId?: number;
  multiple?: boolean;
  noMatchId?: boolean;
}

export const SelectTransaction: React.FC<SelectTransactionProps> = ({ name, userId, multiple, noMatchId }) => {
  const { data, isLoading } = trpc.transaction.findAll.useQuery({ userId });
  return (
    <AutocompleteElement
      name={name}
      options={data ? data.sort((a, b) => a.date.getTime() - b.date.getTime()) : []}
      multiple={multiple}
      matchId={!noMatchId}
      label={`Ancien${multiple ? 's' : ''} paiement${multiple ? 's' : ''}`}
      loading={isLoading}
      autocompleteProps={{
        disabled: isLoading,
        getOptionLabel: (option: Transaction | undefined) => option ? displayTransactionWithDate(option) : '...',
        renderOption: (props, option: Transaction | undefined) => option ? (
          <li {...props} key={option.id}>
            {displayTransactionWithDate(option)}
          </li>
        ) : '...',
      }}
    />
  );
};
