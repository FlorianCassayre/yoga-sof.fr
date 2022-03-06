import { useRouter } from 'next/router';
import { BsCalendarEvent } from 'react-icons/bs';
import { CourseForm } from '../../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';
import { breadcrumbForCoursePlanningEdit } from '../../../../../lib/client';

export default function AdminSeancePlanningEdit() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout>
      <CourseForm
        editRecordId={id}
        // eslint-disable-next-line react/no-unstable-nested-components
        container={({ data, ...props }) => <ContentLayout {...props} title="Modification d'une séance planifiée" icon={BsCalendarEvent} breadcrumb={data && breadcrumbForCoursePlanningEdit(data)} />}
      />
    </PrivateLayout>
  );
}
