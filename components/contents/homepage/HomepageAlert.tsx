import React from 'react';
import { Alert } from '@mui/material';

interface HomepageAlertProps {
  children: React.ReactNode;
}

export const HomepageAlert: React.FC<HomepageAlertProps> = ({ children }) => {
  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      {children}
    </Alert>
  );
};
