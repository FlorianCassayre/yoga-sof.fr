'use client';

import type { SxProps, Theme } from '@mui/material';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';

interface PriceFieldElementProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label: string;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

export const PriceFieldElement = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  disabled,
  sx,
}: PriceFieldElementProps<TFieldValues, TName>) => (
  <TextFieldElement<TFieldValues, TName>
    name={name}
    label={label}
    type="number"
    rules={{ required: 'Le prix est requis.' }}
    disabled={disabled}
    sx={sx}
    slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
  />
);
