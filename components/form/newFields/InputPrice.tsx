import React from 'react';
import { SliderElement } from 'react-hook-form-mui';

interface InputPriceProps {
  name: string;
}

export const InputPrice: React.FC<InputPriceProps> = ({ name }) => {
  return (
    <SliderElement name={name} min={0} max={50} label="Prix par séance en euros" />
  );
};
