import React from 'react';
import { FrontsiteContainerLayout } from './FrontsiteContainerLayout';

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
  return (
    <FrontsiteContainerLayout
      title="Yoga Sof"
      sections={commonSections}
      profile={undefined}
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
