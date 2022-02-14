import { useRouter } from 'next/router';
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
          container={({ data, ...props }) => (
            <ContentLayout {...props} title="Modification d'une séance planifiée" breadcrumb={data && breadcrumbForSessionPlanningEdit(data)} />
          )}
        />

    </PrivateLayout>
  );
}
