import React from 'react';
import { SliderElement } from 'react-hook-form-mui';

interface InputSlotsProps {
  name: string;
}

export const InputSlots: React.FC<InputSlotsProps> = ({ name }) => {
  return (
    <SliderElement name={name} min={1} max={50} label="Nombre de places" />
  );
};
