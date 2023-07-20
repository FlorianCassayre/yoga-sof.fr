import React from 'react';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { Payments, ShoppingCart } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { OrderGrid } from '../../../components/grid/grids/OrderGrid';
import { UnpaidItemsGrid } from '../../../components/grid/grids/UnpaidItemsGrid';
import {
  CourseRegistrationForReplacementGrid
} from '../../../components/grid/grids/CourseRegistrationForReplacementGrid';
import { useBackofficeWritePermission } from '../../../components/hooks/usePermission';

export default function AdminPayments() {
  const hasWritePermission = useBackofficeWritePermission();
  return (
    <BackofficeContent
      title="Paiements"
      icon={<Payments />}
      quickActions={hasWritePermission ? [
        { icon: <ShoppingCart />, name: 'Enregistrer un paiement', url: '/administration/paiements/creation' },
      ] : []}
    >
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Derniers paiements enregistrés
      </Typography>
      <Typography paragraph>
        Les paiements associent une transaction (espèces ou HelloAsso) à des articles (séances, cotisations et cartes).
      </Typography>
      <OrderGrid />
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Articles impayés
      </Typography>
      <Typography paragraph>
        Les articles n'ayant pas encore de paiement associé sont affichés ci-dessous.
      </Typography>
      <UnpaidItemsGrid />
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Inscriptions à rattraper
      </Typography>
      <Typography paragraph>
        Si des utilisateurs ont payé pour des inscriptions à des séances qui ont par la suite été annulées, ces dernières peuvent être utilisées en tant que remplacement pour une autre inscription.
      </Typography>
      <CourseRegistrationForReplacementGrid />
    </BackofficeContent>
  );
}
