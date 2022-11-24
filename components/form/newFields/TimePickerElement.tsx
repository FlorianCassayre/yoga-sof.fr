import React from 'react';
import { TextFieldElement } from 'react-hook-form-mui';

interface TimePickerElementProps {
  name: string;
  label?: string;
}

export const TimePickerElement: React.FC<TimePickerElementProps> = ({ name, label }) => {
  return (
    <TextFieldElement name={name} label={label} placeholder="HH:MM" fullWidth />
  );
};
