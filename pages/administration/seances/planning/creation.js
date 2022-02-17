import { BsCalendarEvent } from 'react-icons/bs';
import { SessionBatchCreateForm } from '../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../components/layout/admin';
import { BREADCRUMB_SESSION_PLANNING_CREATE } from '../../../../lib/client';

export default function AdminSeancePlanningCreate() {
  return (
    <PrivateLayout>
      <ContentLayout title="Planification de nouvelles séances" icon={BsCalendarEvent} breadcrumb={BREADCRUMB_SESSION_PLANNING_CREATE}>
        <SessionBatchCreateForm />
      </ContentLayout>
    </PrivateLayout>
  );
}
