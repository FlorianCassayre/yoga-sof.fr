import React from 'react';
import { TextFieldElement, useController } from 'react-hook-form-mui';
import { InputAdornment } from '@mui/material';
import { Euro } from '@mui/icons-material';

interface InputPriceProps {
  name: string;
  disabled?: boolean;
  label?: string;
  allowNegative?: boolean;
}

export const InputPrice: React.FC<InputPriceProps> = ({ name, disabled, label, allowNegative }) => {
  const { field } = useController({ name });
  return (
    <TextFieldElement
      name={name}
      type="number"
      onChange={(event) => field.onChange(+event.target.value)}
      inputProps={{ min: allowNegative ? undefined : 0 }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Euro />
          </InputAdornment>
        ),
      }}
      label={label ?? `Prix par séance en euros`}
      disabled={disabled}
      fullWidth
    />
  );
};
