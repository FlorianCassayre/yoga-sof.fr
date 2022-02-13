import { useRouter } from 'next/router';
import { SessionForm } from '../../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';
import { breadcrumbForSessionPlanningEdit } from '../../../../../lib/client';

export default function AdminSeancePlanningEdit({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout pathname={pathname}>

        <SessionForm
          editRecordId={id}
          container={({ data, ...props }) => (
            <ContentLayout {...props} pathname={pathname} title="Modification d'une séance planifiée" breadcrumb={data && breadcrumbForSessionPlanningEdit(data)} />
          )}
        />

    </PrivateLayout>
  );
}

AdminSeancePlanningEdit.getInitialProps = ({ pathname })  => {
  return { pathname };
}
