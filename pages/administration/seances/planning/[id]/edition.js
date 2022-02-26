import { useRouter } from 'next/router';
import { BsCalendarEvent } from 'react-icons/bs';
import { SessionForm } from '../../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';
import { breadcrumbForSessionPlanningEdit } from '../../../../../lib/client';

export default function AdminSeancePlanningEdit() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout>
      <SessionForm
        editRecordId={id}
        // eslint-disable-next-line react/no-unstable-nested-components
        container={({ data, ...props }) => <ContentLayout {...props} title="Modification d'une séance planifiée" icon={BsCalendarEvent} breadcrumb={data && breadcrumbForSessionPlanningEdit(data)} />}
      />
    </PrivateLayout>
  );
}
