import React from 'react';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { AdminPanelSettings } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { AdminWhitelistGrid } from '../../components/grid/grids/AdminWhitelistGrid';

export default function AdminAdmins() {
  return (
    <BackofficeContent
      title="Administrateurs"
      icon={<AdminPanelSettings />}
    >
      <Typography paragraph>
        Liste blanche des adresses emails autorisées à se connecter en tant qu'administrateur. Pour des raisons de sécurité, cette liste n'est pas directement modifiable depuis l'interface.
      </Typography>
      <AdminWhitelistGrid />
    </BackofficeContent>
  );
}
