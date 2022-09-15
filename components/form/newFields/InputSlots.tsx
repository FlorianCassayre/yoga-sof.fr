import React from 'react';
import { SliderElement } from 'react-hook-form-mui';

interface InputSlotsProps {
  name: string;
  disabled?: boolean;
}

export const InputSlots: React.FC<InputSlotsProps> = ({ name, disabled }) => {
  return (
    <SliderElement name={name} min={1} max={50} label="Nombre de places" disabled={disabled} />
  );
};
