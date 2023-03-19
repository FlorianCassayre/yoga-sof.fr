import React from 'react';
import { SliderElement, TextFieldElement, useController } from 'react-hook-form-mui';

interface InputYearProps {
  name: string;
  label?: string;
  disabled?: boolean;
}

export const InputYear: React.FC<InputYearProps> = ({ name, label, disabled }) => {
  const { field } = useController({ name });
  return (
    <TextFieldElement
      name={name}
      type="number"
      onChange={(event) => field.onChange(+event.target.value)}
      inputProps={{ min: 2021, max: 2100 }}
      label={label ?? 'Année'}
      disabled={disabled}
      fullWidth
    />
  );
};
