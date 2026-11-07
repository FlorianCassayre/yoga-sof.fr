'use client';

import { Euro } from 'lucide-react';

import type { PageAction, PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { useHasPermission } from '../user/useHasPermission';
import { MembershipGrid } from './MembershipGrid';
import { MembershipIcon } from './MembershipIcon';

export const MembershipsPage = () => {
  const canManage = useHasPermission('manageData');
  const canSet = useHasPermission('manageSettings');
  const children: PageAction[] = [
    ...(canManage
      ? ([
          { label: 'Nouvelle adhésion', href: '/adhesions/creation', fab: true },
        ] satisfies PageAction[])
      : []),
    ...(canSet
      ? ([
          { label: 'Modifier les tarifs', icon: Euro, href: '/parametres/adhesions' },
        ] satisfies PageAction[])
      : []),
  ];
  const actions: PageActionGroup[] | undefined = children.length > 0 ? [{ children }] : undefined;

  return (
    <PageLayout icon={MembershipIcon} title="Adhésions" actions={actions}>
      <MembershipGrid />
    </PageLayout>
  );
};
