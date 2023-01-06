import React from 'react';
import { TextFieldElement } from 'react-hook-form-mui';

interface TimePickerElementProps {
  name: string;
  label?: string;
  disabled?: boolean;
}

export const TimePickerElement: React.FC<TimePickerElementProps> = ({ name, label, disabled }) => {
  return (
    <TextFieldElement name={name} label={label} disabled={disabled} placeholder="HH:MM" fullWidth />
  );
};
