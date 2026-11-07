'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { MembershipEditForm } from './MembershipEditForm';
import { MembershipIcon } from './MembershipIcon';

interface MembershipEditPageProps {
  id: string;
}

export const MembershipEditPage = ({ id }: MembershipEditPageProps) => {
  return (
    <PageLayout icon={MembershipIcon} title="Modifier l'adhésion">
      <MembershipEditForm id={Number(id)} />
    </PageLayout>
  );
};
