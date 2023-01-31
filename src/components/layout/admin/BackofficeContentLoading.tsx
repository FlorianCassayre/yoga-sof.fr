import React from 'react';
import { LinearProgress } from '@mui/material';
import { BackofficeContentBase } from './BackofficeContentBase';

export const BackofficeContentLoading: React.FC = () => {
  return (
    <BackofficeContentBase title="Chargement...">
      <LinearProgress />
    </BackofficeContentBase>
  );
}
