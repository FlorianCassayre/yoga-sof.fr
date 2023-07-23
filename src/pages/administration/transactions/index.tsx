import React from 'react';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { Add, CreateNewFolder, SwapHoriz } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { OtherPaymentCategoryGrid } from '../../../components/grid/grids/OtherPaymentCategoryGrid';
import { OtherPaymentGrid } from '../../../components/grid/grids/OtherPaymentGrid';

export default function AdminOtherPayments() {
  return (
    <BackofficeContent
      title="Transactions"
      icon={<SwapHoriz />}
      quickActions={[
        { icon: <CreateNewFolder />, name: 'Nouvelle catégorie de transaction', url: '/administration/transactions/categories/creation' },
        { icon: <Add />, name: 'Nouvelle transaction', url: '/administration/transactions/creation' },
      ]}
    >
      <Typography variant="h6" component="div">
        Transactions
      </Typography>
      <Typography paragraph>
        Toutes les transactions autres que celles présentes dans l'onglet "paiements".
      </Typography>
      <OtherPaymentGrid />

      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Catégories
      </Typography>
      <Typography paragraph>
        Liste des catégories de transactions définies ainsi que le nombre de transactions associées.
      </Typography>
      <OtherPaymentCategoryGrid />
    </BackofficeContent>
  );
}
