import React from 'react';
import { BackofficeContainerLayout } from './BackofficeContainerLayout';
import { AdminPanelSettings, Assignment, Dashboard, DateRange, Email, Euro, People } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { Typography } from '@mui/material';
import pkg from '../../../package.json';

interface BackofficeContainerProps {
  children: React.ReactNode;
}

export const BackofficeContainer: React.FC<BackofficeContainerProps> = ({ children }) => {
  const session = useSession();

  return (
    <BackofficeContainerLayout
      title="Yoga Sof"
      menu={[
        {
          children: [
            { title: 'Aperçu', icon: <Dashboard />, url: '/administration' }
          ]
        },
        {
          title: 'Yoga',
          children: [
            { title: 'Séances', icon: <DateRange />, url: '/administration/seances' },
            { title: 'Inscriptions', icon: <Assignment /> },
            { title: 'Comptabilité', icon: <Euro />, disabled: true },
          ]
        },
        {
          title: 'Administration',
          children: [
            { title: 'Administrateurs', icon: <AdminPanelSettings />, url: '/administration/administrateurs' },
            { title: 'Utilisateurs', icon: <People />, url: '/administration/utilisateurs' },
            { title: 'Emails', icon: <Email />, url: '/administration/emails' },
          ]
        }
      ]}
      profileMenu={{
        children: [
          { title: 'Profil', icon: <People /> },
        ]
      }}
      footer={(
        <Typography align="center">
          Version {pkg.version}
        </Typography>
      )}
    >
      {children}
    </BackofficeContainerLayout>
  );
}
