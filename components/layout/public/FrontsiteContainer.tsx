import React, { useMemo } from 'react';
import { FrontsiteContainerLayout } from './FrontsiteContainerLayout';
import { useSession } from 'next-auth/react';
import { AdminPanelSettings, Assignment, DateRange, Logout } from '@mui/icons-material';
import { UserType } from '../../../lib/common/all';

interface FrontsiteContainerProps {
  children: React.ReactNode;
}

const commonSections = [
  { title: 'Accueil', url: '/' },
  { title: 'Le Yoga', url: '#' },
  { title: 'Les séances', url: '#' },
  { title: 'Inscription', url: '#' },
  { title: 'À propos', url: '#' },
];

export const FrontsiteContainer: React.FC<FrontsiteContainerProps> = ({ children }) => {
  const { data: session, status } = useSession();

  const profile = useMemo(() => {
    if (status === 'loading') {
      return undefined;
    } else if (session === null) {
      return null;
    } else {
      return {
        title: session.displayName ?? session.displayEmail ?? '?',
        children: [
          ...(session.userType === UserType.Admin ? [{
            children: [
              { title: 'Administration', icon: <AdminPanelSettings />, url: '/administration' },
            ]
          }] : []),
          {
            children: [
              { title: 'Inscription à des séances', icon: <Assignment /> },
              { title: 'Consulter mes inscriptions', icon: <DateRange /> },
            ]
          },
          {
            children: [
              { title: 'Déconnexion', icon: <Logout /> },
            ],
          },
        ],
      };
    }
  }, [session, status]);

  return (
    <FrontsiteContainerLayout
      title="Yoga Sof"
      sections={commonSections}
      profile={profile}
      footerSections={[
        ...commonSections,
        { title: 'Règlement intérieur', url: '/reglement-interieur' },
        { title: 'Politique de confidentialité', url: '/confidentialite' },
      ]}
      footerSubtitle={['Sophie Richaud-Cassayre', 'Enseignante de Yoga']}
    >
      {children}
    </FrontsiteContainerLayout>
  );
};
