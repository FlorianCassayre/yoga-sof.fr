'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CardGrid } from './CardGrid';
import { CardIcon } from './CardIcon';

export const CardsPage = () => {
  return (
    <PageLayout
      icon={CardIcon}
      title="Cartes"
      actions={[
        {
          children: [
            { label: 'Nouvelle carte', href: '/cartes/creation', fab: true },
            { label: 'Modifier les modèles', icon: CardIcon, href: '/parametres/cartes' },
          ],
        },
      ]}
    >
      <CardGrid />
    </PageLayout>
  );
};
