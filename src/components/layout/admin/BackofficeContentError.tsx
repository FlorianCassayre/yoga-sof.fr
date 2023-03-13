import React from 'react';
import { Alert, Box } from '@mui/material';
import { BackofficeContentBase } from './BackofficeContentBase';

interface BackofficeContentError {
  error?: any;
}

export const BackofficeContentError: React.FC<BackofficeContentError> = () => {
  return (
    <BackofficeContentBase title="Erreur">
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Une erreur est survenue lors l'acquisition des données.
        </Alert>
      </Box>
    </BackofficeContentBase>
  );
}
