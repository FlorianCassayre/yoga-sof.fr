import React from 'react';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { Merge, Notes, People, Person } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { UserGrid } from '../../../components/grid/grids/UserGrid';
import { useBackofficeWritePermission } from '../../../components/hooks/usePermission';

export default function AdminAdmins() {
  const hasWritePermission = useBackofficeWritePermission();
  return (
    <BackofficeContent
      title="Utilisateurs"
      icon={<People />}
      actions={hasWritePermission ? [
        { name: 'Fusionner des utilisateurs', icon: <Merge/>, url: '/administration/utilisateurs/fusion' },
      ] : []}
      quickActions={hasWritePermission ? [
        { icon: <Person />, name: 'Nouvel utilisateur', url: '/administration/utilisateurs/creation' }
      ] : []}
    >
      <Typography paragraph>
        Liste des comptes utilisateurs. Dès qu'un utilisateur se connecte avec un nouveau service, un nouveau compte est automatiquement créé. De plus, vous avez la possibilité de créer manuellement
        des comptes utilisateurs. Notez que pour les comptes que vous créez vous-même, aucun service n'est lié donc personne ne pourra s'y connecter.
      </Typography>
      <UserGrid disabledUsers={false} />
    </BackofficeContent>
  );
}
