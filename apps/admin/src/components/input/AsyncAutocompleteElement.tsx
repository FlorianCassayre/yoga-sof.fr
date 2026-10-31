'use client';

import type { AutocompleteValue, ChipTypeMap } from '@mui/material';
import { keepPreviousData, skipToken } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { FieldValues, PathValue } from 'react-hook-form';
import {
  AutocompleteElement,
  type AutocompleteElementProps,
  type FieldPath,
} from 'react-hook-form-mui';

import { type ListProcedure } from '../grid/DataGrid';

const PAGE_SIZE = 50;

const useDebouncedValue = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [delay, value]);
  return debounced;
};

type AsyncAutocompleteElementProps<
  Model extends { id: string | number },
  TFieldValues extends FieldValues,
  Multiple extends boolean | undefined,
> = Omit<
  AutocompleteElementProps<
    Model,
    Multiple,
    boolean,
    false,
    ChipTypeMap['defaultComponent'],
    TFieldValues,
    FieldPath<TFieldValues>
  >,
  | 'control'
  | 'rules'
  | 'options'
  | 'loading'
  | 'loadingIndicator'
  | 'autocompleteProps'
  | 'transform'
  | 'matchId'
  | 'textFieldProps'
> & {
  list: ListProcedure<Model>;
  sort: { field: keyof Model & string; sort: 'asc' | 'desc' };
  getOptionLabel: (option: Model) => string;
  listInput?: Record<string, unknown>;
  preload?: boolean;
  disabled?: boolean;
};

export const AsyncAutocompleteElement = <
  Model extends { id: string | number },
  TFieldValues extends FieldValues,
  Multiple extends boolean | undefined = undefined,
>({
  name,
  label,
  multiple,
  list,
  sort,
  getOptionLabel,
  listInput,
  preload,
  disabled,
  ...rest
}: AsyncAutocompleteElementProps<Model, TFieldValues, Multiple>) => {
  const [inputValue, setInputValue] = useState('');
  const debouncedInputValue = useDebouncedValue(inputValue);

  const initialQuery = list.useQuery(
    preload ? { page: 0, pageSize: PAGE_SIZE, sort: [sort], ...listInput } : skipToken,
    { placeholderData: keepPreviousData },
  );
  const searchQuery = list.useQuery(
    debouncedInputValue === ''
      ? skipToken
      : { page: 0, pageSize: PAGE_SIZE, search: debouncedInputValue, sort: [sort], ...listInput },
    { placeholderData: keepPreviousData },
  );

  // A full page means the list is truncated: only complete lists are shown upfront.
  const initialOptions =
    preload && (initialQuery.data?.total ?? 0) <= PAGE_SIZE ? (initialQuery.data?.rows ?? []) : [];
  const options = inputValue === '' ? initialOptions : (searchQuery.data?.rows ?? []);

  return (
    <AutocompleteElement<
      Model,
      Multiple,
      boolean,
      false,
      ChipTypeMap['defaultComponent'],
      TFieldValues,
      FieldPath<TFieldValues>
    >
      name={name}
      label={label}
      multiple={multiple}
      options={options}
      loading={searchQuery.isFetching || initialQuery.isFetching}
      transform={{
        // The form values ARE the options; without this identity transform,
        // AutocompleteElement re-maps them through the current (often empty)
        // options list and its unmemoized output churns identity every render.
        input: (value: PathValue<TFieldValues, FieldPath<TFieldValues>>) => value,
        output: (_, value: AutocompleteValue<Model, Multiple, boolean, false>) =>
          value as PathValue<TFieldValues, FieldPath<TFieldValues>>,
      }}
      autocompleteProps={{
        inputValue,
        disabled,
        getOptionLabel,
        isOptionEqualToValue: (option: Model, value: Model) => option.id === value.id,
        onInputChange: (_, value: string) => setInputValue(value),
        filterOptions: (allOptions: Model[]) => allOptions, // Disable MUI's local filtering
        forcePopupIcon: false, // Caret is hidden for the typeahead use case
        noOptionsText: inputValue ? undefined : 'Commencez à taper pour rechercher',
      }}
      {...rest}
    />
  );
};
