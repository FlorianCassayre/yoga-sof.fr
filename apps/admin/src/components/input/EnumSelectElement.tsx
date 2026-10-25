'use client';

import { InputAdornment, Stack, Typography } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { SelectElement } from 'react-hook-form-mui';

interface EnumSelectElementProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  Value extends string = string,
> {
  name: TName;
  label: string;
  values: readonly Value[];
  labels: Record<Value, string>;
  icons?: Partial<Record<Value, LucideIcon>>;
  disabled?: boolean;
}

export const EnumSelectElement = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  Value extends string = string,
>({
  name,
  label,
  values,
  labels,
  icons,
  disabled,
}: EnumSelectElementProps<TFieldValues, TName, Value>) => {
  const { watch } = useFormContext<TFieldValues>();
  const SelectedIcon: LucideIcon | undefined = icons?.[watch(name) as Value];

  return (
    <SelectElement<TFieldValues, TName>
      name={name}
      label={label}
      disabled={disabled}
      options={values.map((value) => {
        const Icon: LucideIcon | undefined = icons?.[value];

        return {
          id: value,
          label: (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {Icon && <Icon size={18} />}
              <Typography>{labels[value]}</Typography>
            </Stack>
          ),
        };
      })}
      slotProps={{
        select: {
          renderValue: (selected) => labels[selected as Value],
          startAdornment: SelectedIcon ? (
            <InputAdornment position="start">
              <SelectedIcon size={18} />
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
};
