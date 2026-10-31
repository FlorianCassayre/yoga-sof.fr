'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { MembershipForm } from './MembershipForm';
import { MembershipIcon } from './MembershipIcon';

export const MembershipCreatePage = () => {
  return (
    <PageLayout icon={MembershipIcon} title="Nouvelle adhésion">
      <MembershipForm />
    </PageLayout>
  );
};
