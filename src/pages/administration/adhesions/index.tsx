import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { Groups, PersonAdd } from '@mui/icons-material';
import { Typography } from '@mui/material';
import React from 'react';
import { CouponGrid } from '../../../components/grid/grids/CouponGrid';
import { MembershipModelCards } from '../../../components/MembershipModelCards';
import { MembershipGrid } from '../../../components/grid/grids/MembershipGrid';

export default function AdminMemberships() {

  return (
    <BackofficeContent
      title="Adhésions"
      icon={<Groups />}
      actions={[
        { icon: <PersonAdd />, name: 'Créer une ou plusieurs adhésions', url: '/administration/adhesions/membres/creation' },
        { icon: <Groups />, name: `Nouveau type d'adhésion`, url: '/administration/adhesions/types/creation' },
      ]}
    >
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Types d'adhésions
      </Typography>
      <Typography paragraph>
        Les adhésions se présentent soit sous la forme de cotisations individuelles ou bien de cotisations familiales.
      </Typography>
      <MembershipModelCards />

      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Adhésions
      </Typography>
      <Typography paragraph>
        Les adhésions sont valables pour une durée d'un an ; ci-dessous toutes les adhésions à l'association.
      </Typography>
      <MembershipGrid />
    </BackofficeContent>
  );
}
