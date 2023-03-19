import React from 'react';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { Payments, ShoppingCart } from '@mui/icons-material';
import { Alert, Typography } from '@mui/material';
import { TransactionGrid } from '../../../components/grid/grids/TransactionGrid';

export default function AdminPayments() {
  return (
    <BackofficeContent
      title="Paiements"
      icon={<Payments />}
      quickActions={[
        { icon: <Payments />, name: 'Enregistrer un paiement', url: '/administration/paiements/creation' },
        { icon: <ShoppingCart />, name: 'Enregistrer une commande', url: '/administration/paiements/commandes/creation' },
      ]}
    >
      <Alert severity="info">
        Le système de paiements est en cours d'élaboration.
        Pour le moment vous avez la possibilité d'entrer les paiements reçus de la part des pratiquants, mais vous ne pouvez pas encore les lier aux séances.
      </Alert>
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Paiements sans commande
      </Typography>
      <Typography paragraph>
        Les paiements suivants n'ont pas encore de commande associée.
        Pour chacun d'entre eux, vous devrez créer une commande afin d'indiquer quelles séances, cotisations et cartes ont été payés.
        Il est recommandé de traiter ces données pour chaque utilisateur, et de procéder du paiement le plus ancien au plus récent.
        Vous aurez terminé la migration lorsque la liste sera vide.
      </Typography>
      <TransactionGrid />
    </BackofficeContent>
  );
}
