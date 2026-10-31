'use client';

import { Euro } from 'lucide-react';

import { PageLayout } from '../../components/page/PageLayout';
import { MembershipGrid } from './MembershipGrid';
import { MembershipIcon } from './MembershipIcon';

export const MembershipsPage = () => {
  return (
    <PageLayout
      icon={MembershipIcon}
      title="Adhésions"
      actions={[
        {
          children: [
            { label: 'Nouvelle adhésion', href: '/adhesions/creation', fab: true },
            { label: 'Modifier les tarifs', icon: Euro, href: '/parametres/adhesions' },
          ],
        },
      ]}
    >
      <MembershipGrid />
    </PageLayout>
  );
};
