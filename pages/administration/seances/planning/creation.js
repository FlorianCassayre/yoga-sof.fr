import { BsCalendarEvent } from 'react-icons/bs';
import { CourseBatchCreateForm } from '../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../components/layout/admin';
import { BREADCRUMB_COURSE_PLANNING_CREATE } from '../../../../lib/client';

export default function AdminSeancePlanningCreate() {
  return (
    <PrivateLayout>
      <ContentLayout title="Planification de nouvelles séances" icon={BsCalendarEvent} breadcrumb={BREADCRUMB_COURSE_PLANNING_CREATE}>
        <CourseBatchCreateForm />
      </ContentLayout>
    </PrivateLayout>
  );
}
