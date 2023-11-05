import React from 'react';
import { Box, Button } from '@mui/material';
import { AddBox } from '@mui/icons-material';

interface CreateButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export const CreateButton: React.FC<CreateButtonProps> = ({ label, disabled, onClick }) => {
  return (
    <Box sx={{ p: 0, border: '1px dashed lightgrey', borderRadius: 1 }}>
      <Button disabled={disabled} onClick={() => onClick()} startIcon={<AddBox />} sx={{ width: '100%' }}>{label}</Button>
    </Box>
  );
};
