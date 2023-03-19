import React from 'react';
import { SliderElement, TextFieldElement, useController } from 'react-hook-form-mui';

interface InputCourseQuantityProps {
  name: string;
}

export const InputCourseQuantitySlots: React.FC<InputCourseQuantityProps> = ({ name }) => {
  const { field } = useController({ name });
  return (
    <TextFieldElement
      name={name}
      type="number"
      onChange={(event) => field.onChange(+event.target.value)}
      inputProps={{ min: 1, max: 50 }}
      label="Nombre de séances"
      fullWidth
    />
  );
};
