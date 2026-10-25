'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { UserGrid } from './UserGrid';
import { UserIcon } from './UserIcon';

export const UsersPage = () => {
  return (
    <PageLayout icon={UserIcon} title="Utilisateurs">
      <UserGrid />
    </PageLayout>
  );
};
