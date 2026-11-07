'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { NotificationIcon } from './NotificationIcon';
import { NotificationsGrid } from './NotificationsGrid';

export const NotificationsPage = () => {
  return (
    <PageLayout icon={NotificationIcon} title="Tâches à effectuer">
      <NotificationsGrid />
    </PageLayout>
  );
};
