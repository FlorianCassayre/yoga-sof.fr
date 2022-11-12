import React from 'react';
import { BackofficeContainerLayout } from './BackofficeContainerLayout';
import {
  AdminPanelSettings,
  Assignment,
  Dashboard,
  DateRange,
  Email,
  Euro,
  Home,
  Logout,
  People, Settings
} from '@mui/icons-material';
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
      url="/administration"
      menu={[
        {
          children: [
            { title: 'Aperçu', icon: <Dashboard />, url: '/administration' }
          ]
        },
        {
          title: 'Organisation',
          children: [
            { title: 'Séances', icon: <DateRange />, url: '/administration/seances' },
            { title: 'Inscriptions', icon: <Assignment />, url: '/administration/inscriptions' },
            { title: 'Utilisateurs', icon: <People />, url: '/administration/utilisateurs' },
            { title: 'Comptabilité', icon: <Euro />, disabled: true },
          ]
        },
        {
          title: 'Administration',
          children: [
            { title: 'Administrateurs', icon: <AdminPanelSettings />, url: '/administration/administrateurs' },
            { title: 'Emails', icon: <Email />, url: '/administration/emails' },
            { title: 'Paramètres', icon: <Settings />, url: '/administration/parametres' },
          ],
        },
        {
          children: [
            { title: 'Voir le site', icon: <Home />, url: '/' },
          ],
        },
      ]}
      profileMenu={{
        children: [
          { title: 'Profil', icon: <People /> },
          { title: 'Se déconnecter', icon: <Logout /> },
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
