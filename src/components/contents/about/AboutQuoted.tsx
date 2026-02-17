import React from 'react';
import { Typography } from '@mui/material';
import { FormatQuoteTwoTone } from '@mui/icons-material';

interface AboutQuotedProps {
  children: React.ReactNode;
}

export const AboutQuoted: React.FC<AboutQuotedProps> = ({ children }) => {
  return (
    <Typography paragraph align="justify" sx={{ fontStyle: 'italic' }}>
      <FormatQuoteTwoTone sx={{ mr: 1, mb: -1, transform: 'rotate(180deg)' }} />
      {children}
      <FormatQuoteTwoTone sx={{ ml: 1, mt: -1 }} />
    </Typography>
  );
};
