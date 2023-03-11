import React from 'react';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { Payments } from '@mui/icons-material';
import { Alert, Typography } from '@mui/material';
import { TransactionGrid } from '../../../components/grid/grids/TransactionGrid';

export default function AdminPayments() {
  return (
    <BackofficeContent
      title="Paiements"
      icon={<Payments />}
      quickActions={[
        { icon: <Payments />, name: 'Enregister un paiement', url: '/administration/paiements/creation' }
      ]}
    >
      <Alert severity="info">
        Le système de paiements est en cours d'élaboration.
        Pour le moment vous avez la possibilité d'entrer les paiements reçus de la part des pratiquants, mais vous ne pouvez pas encore les lier aux séances.
      </Alert>
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Derniers paiements
      </Typography>
      <Typography paragraph>
        Liste des paiements enregistrés.
      </Typography>
      <TransactionGrid />
    </BackofficeContent>
  );
}
