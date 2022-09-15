import React from 'react';
import { SliderElement } from 'react-hook-form-mui';

interface InputPriceProps {
  name: string;
  disabled?: boolean;
}

export const InputPrice: React.FC<InputPriceProps> = ({ name, disabled }) => {
  return (
    <SliderElement name={name} min={0} max={50} label="Prix par séance en euros" disabled={disabled} />
  );
};
