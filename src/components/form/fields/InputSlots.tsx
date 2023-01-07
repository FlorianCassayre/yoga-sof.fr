import React from 'react';
import { SliderElement, TextFieldElement, useController } from 'react-hook-form-mui';

interface InputSlotsProps {
  name: string;
  disabled?: boolean;
}

export const InputSlots: React.FC<InputSlotsProps> = ({ name, disabled }) => {
  const { field } = useController({ name });
  return (
    <TextFieldElement
      name={name}
      type="number"
      onChange={(event) => field.onChange(+event.target.value)}
      inputProps={{ min: 1, max: 50 }}
      label="Nombre de places"
      disabled={disabled}
      fullWidth
    />
  );
};
