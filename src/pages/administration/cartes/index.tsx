import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { CardGiftcard, AddCard } from '@mui/icons-material';
import { Typography } from '@mui/material';
import React from 'react';
import { CouponModelCards } from '../../../components/CouponModelCards';
import { CouponGrid } from '../../../components/grid/grids/CouponGrid';

export default function AdminCoupons() {

  return (
    <BackofficeContent
      title="Cartes"
      icon={<CardGiftcard />}
      actions={[
        { icon: <AddCard />, name: 'Générer une carte', url: '/administration/cartes/emises/creation' },
        { icon: <CardGiftcard />, name: 'Nouveau type de carte', url: '/administration/cartes/types/creation' },
      ]}
    >
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Types de cartes
      </Typography>
      <Typography paragraph>
        Ces types correspondent aux cartes qui seront (à l'avenir) achetables depuis la boutique.
        Tout comme les modèles de séances, vous pouvez modifier et/ou supprimer des types de cartes sans affecter les cartes qui ont déjà été générées.
      </Typography>
      <CouponModelCards />

      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Cartes émises
      </Typography>
      <Typography paragraph>
        Une carte émise peut être utilisée comme moyen de paiement dans la boutique.
        Elle peut être désactivée par un administrateur.
      </Typography>
      <CouponGrid />
    </BackofficeContent>
  );
}
