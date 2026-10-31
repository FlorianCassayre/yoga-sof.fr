'use client';

import type { FieldPath, FieldValues } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';

interface PriceFieldElementProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label: string;
  disabled?: boolean;
}

export const PriceFieldElement = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  disabled,
}: PriceFieldElementProps<TFieldValues, TName>) => (
  <TextFieldElement<TFieldValues, TName>
    name={name}
    label={label}
    type="number"
    rules={{ required: 'Le prix est requis.' }}
    disabled={disabled}
    slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
  />
);
