import React from 'react';
import { AutocompleteElement } from 'react-hook-form-mui';
import { trpc } from '../../../common/trpc';
import { CourseModel } from '@prisma/client';
import { displayCourseModelName } from '../../../common/display';
import { Box } from '@mui/material';
import { ConvertInput, InputIdentifier, ProcedureQueryArray } from '../../../server/controllers/types';
import { DecorateProcedure } from '@trpc/react-query/dist/shared';
import { inferProcedureInput } from '@trpc/server';

interface AsyncSelectProps<TOutputElement extends InputIdentifier, TProcedure extends ProcedureQueryArray<TOutputElement, unknown>> {
  name: string;
  label: string;
  renderOptionLabel: (option: ConvertInput<TOutputElement>) => string;
  input: inferProcedureInput<TProcedure>;
  procedure: DecorateProcedure<TProcedure, any, any>;
  multiple?: boolean;
  disabled?: boolean;
}

export const AsyncSelect = <TOutputElement extends InputIdentifier, TProcedure extends ProcedureQueryArray<TOutputElement, unknown>>({ name, label, renderOptionLabel, input, procedure, multiple, disabled }: AsyncSelectProps<TOutputElement, TProcedure>): React.ReactElement => {
  const { data, isLoading } = procedure.useQuery(input);
  return (
    <AutocompleteElement
      name={name}
      options={data ?? []}
      matchId
      multiple={multiple}
      label={label}
      loading={isLoading}
      autocompleteProps={{
        disabled: isLoading || disabled,
        getOptionLabel: (option: TOutputElement | undefined) => option !== undefined ? renderOptionLabel(option) : '',
        renderOption: (props, option: TOutputElement) => ( // Weirdly enough, we need to override this ('supposedly' there is a problem of duplicate keys/labels)
          <Box {...props as any} key={option.id}>
            {renderOptionLabel(option)}
          </Box>
        ),
      }}
    />
  );
};
