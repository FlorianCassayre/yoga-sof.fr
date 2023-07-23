import React from 'react';
import { BackofficeContainerLayout } from './BackofficeContainerLayout';
import {
  AdminPanelSettings,
  Assignment, CardGiftcard,
  Dashboard,
  DateRange,
  Email,
  Euro, Groups,
  Home,
  Logout, Payments,
  People, Settings, SwapHoriz, Timeline
} from '@mui/icons-material';
import { signOut, useSession } from 'next-auth/react';
import { Typography } from '@mui/material';
import pkg from '../../../../package.json';
import { useRouter } from 'next/router';
import { displayUserName } from '../../../common/display';
import { RoleNames } from '../../../common/role';

interface BackofficeContainerProps {
  children: React.ReactNode;
}

export const BackofficeContainer: React.FC<BackofficeContainerProps> = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <BackofficeContainerLayout
      title="Yoga Sof"
      url="/administration"
      menu={[
        {
          children: [
            { title: 'Aperçu', icon: <Dashboard />, url: '/administration' }
          ],
        },
        {
          title: 'Organisation',
          children: [
            { title: 'Séances', icon: <DateRange />, url: '/administration/seances' },
            { title: 'Inscriptions', icon: <Assignment />, url: '/administration/inscriptions' },
            { title: 'Utilisateurs', icon: <People />, url: '/administration/utilisateurs' },
          ]
        },
        {
          title: 'Comptabilité',
          children: [
            { title: 'Paiements', icon: <Payments />, url: '/administration/paiements' },
            { title: 'Adhésions', icon: <Groups />, url: '/administration/adhesions' },
            { title: 'Cartes', icon: <CardGiftcard />, url: '/administration/cartes' },
            { title: 'Transactions', icon: <SwapHoriz />, url: '/administration/transactions' },
            { title: 'Statistiques', icon: <Timeline />, url: '/administration/statistiques' },
          ],
        },
        {
          title: 'Administration',
          children: [
            { title: 'Rôles', icon: <AdminPanelSettings />, url: '/administration/roles' },
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
          { title: `${session!.displayName ?? session!.displayEmail ?? ''} (${RoleNames[session!.role]})`, icon: <People />, url: { pathname: '/administration/utilisateurs/[id]', query: { id: session?.userId } } },
          { title: 'Se déconnecter', icon: <Logout />, onClick: () => signOut({ redirect: true, callbackUrl: '/' }) },
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
