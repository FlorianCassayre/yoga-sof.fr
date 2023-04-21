import React from 'react';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { AutoDelete, Payments, ShoppingCart } from '@mui/icons-material';
import { Alert, Box, Stack, Tooltip, Typography } from '@mui/material';
import { TransactionGrid } from '../../../components/grid/grids/TransactionGrid';
import { OrderGrid } from '../../../components/grid/grids/OrderGrid';
import { UnpaidItemsGrid } from '../../../components/grid/grids/UnpaidItemsGrid';

export default function AdminPayments() {
  return (
    <BackofficeContent
      title="Paiements"
      icon={<Payments />}
      quickActions={[
        //{ icon: <Payments />, name: 'Enregistrer un paiement', url: '/administration/paiements/creation' },
        { icon: <ShoppingCart />, name: 'Enregistrer une commande', url: '/administration/paiements/commandes/creation' },
      ]}
    >
      <Alert severity="info">
        Le système de paiements est en cours d'élaboration.
        Lors de cette deuxième phase il n'est plus possible de créer des paiements : ceux-ci sont remplacés par des <strong>commandes</strong>.
        Tous les anciens paiements doivent être liés à une commande.
      </Alert>
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Commandes
      </Typography>
      <Typography paragraph>
        Les commandes associent un paiement (espèces ou HelloAsso) à des articles (séances, cotisations et cartes), elles remplacent l'ancien système de paiements.
      </Typography>
      <OrderGrid />
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Articles impayés
      </Typography>
      <Typography paragraph>
        Les articles n'ayant pas encore de commande associée sont affichés ci-dessous.
      </Typography>
      <UnpaidItemsGrid />
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box>
            Anciens paiements
          </Box>
          <Tooltip title="Fonctionnalité en cours de suppression">
            <AutoDelete color="action" />
          </Tooltip>
        </Stack>
      </Typography>
      <Typography paragraph>
        Les anciens paiements suivants n'ont pas encore de commande associée.
        Pour chacun d'entre eux, vous devrez créer une commande afin d'indiquer quelles séances, cotisations et cartes ont été payées.
        Il est recommandé de traiter ces données pour chaque utilisateur, et de procéder du paiement le plus ancien au plus récent.
        Vous aurez terminé la migration lorsque la liste sera vide.
        Cette fonctionnalité sera ensuite définitivement supprimée.
      </Typography>
      <TransactionGrid />
    </BackofficeContent>
  );
}
