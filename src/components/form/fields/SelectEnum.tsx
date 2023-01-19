import React from 'react';
import { SelectElement } from 'react-hook-form-mui';

interface SelectEnumProps<T extends string | number> {
  name: string;
  values: T[];
  labels: Record<T, string>;
  label: string;
  disabled?: boolean;
}

export const SelectEnum = <T extends string | number>({ name, values, labels, label, disabled }: SelectEnumProps<T>): React.ReactElement => {
  return (
    <SelectElement
      name={name}
      options={values.map(key => ({
        id: key,
        label: labels[key],
      }))}
      label={label}
      disabled={disabled}
      fullWidth
    />
  );
};
