'use client';

import type { PageAction, PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { useHasPermission } from '../user/useHasPermission';
import { CardGrid } from './CardGrid';
import { CardIcon } from './CardIcon';

export const CardsPage = () => {
  const canManage = useHasPermission('manageData');
  const canSet = useHasPermission('manageSettings');
  const children: PageAction[] = [
    ...(canManage
      ? ([{ label: 'Nouvelle carte', href: '/cartes/creation', fab: true }] satisfies PageAction[])
      : []),
    ...(canSet
      ? ([
          { label: 'Modifier les modèles', icon: CardIcon, href: '/parametres/cartes' },
        ] satisfies PageAction[])
      : []),
  ];
  const actions: PageActionGroup[] | undefined = children.length > 0 ? [{ children }] : undefined;

  return (
    <PageLayout icon={CardIcon} title="Cartes" actions={actions}>
      <CardGrid />
    </PageLayout>
  );
};
