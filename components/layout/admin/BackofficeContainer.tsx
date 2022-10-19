import React from 'react';
import { BackofficeContainerLayout } from './BackofficeContainerLayout';
import { AdminPanelSettings, Assignment, Dashboard, DateRange, Email, Euro, People } from '@mui/icons-material';

interface BackofficeContainerProps {
  children: React.ReactNode;
}

export const BackofficeContainer: React.FC<BackofficeContainerProps> = ({ children }) => {
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
            { title: 'Séances et horaires', icon: <DateRange /> },
            { title: 'Inscriptions', icon: <Assignment /> },
            { title: 'Factures et paiements', icon: <Euro />, disabled: true },
          ]
        },
        {
          title: 'Administration',
          children: [
            { title: 'Administrateurs', icon: <AdminPanelSettings /> },
            { title: 'Utilisateurs', icon: <People /> },
            { title: 'Emails', icon: <Email /> },
          ]
        }
      ]}
    >
      {children}
    </BackofficeContainerLayout>
  );
}
