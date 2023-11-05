import React from 'react';
import { SliderElement, TextFieldElement, useController } from 'react-hook-form-mui';

interface InputIdProps {
  name: string;
  label: string;
  disabled?: boolean;
}

export const InputId: React.FC<InputIdProps> = ({ name, label, disabled }) => {
  const { field } = useController({ name });
  return (
    <TextFieldElement
      name={name}
      type="number"
      onChange={(event) => field.onChange(+event.target.value)}
      inputProps={{ min: 1 }}
      label={label}
      disabled={disabled}
      fullWidth
    />
  );
};
